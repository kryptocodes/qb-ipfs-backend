require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const { MongoClient } = require("mongodb");
const { s3Upload } = require("./s3Uploader");
const URI = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME;

const mongoURL = `${URI}/${dbName}?retryWrites=true&w=majority`;

const url = "https://ipfs.questbook.app:8080/ipfs/";

const client = new MongoClient(mongoURL);

const hashFile = "./hash.json";

async function main() {
  const collection = client.db(dbName).collection("ipfs");
  let failedHashes = [];
  const uploadToDB = async (hash, data) => {
    try {
      const findHash = await collection.findOne({ hash: hash });
      if (findHash) return;
      await collection.insertOne({ hash: hash, data: data });
     console.log("uploaded", hash);
    } catch (error) {
      console.log(error);
    }
  };

  const mediaTypes = ["image", "video", "audio", "application/pdf"];
  const fetchData = async (hash) => {
    try {
    // check if hash is already in db so we don't have to fetch it again
      const checkDuplicate = await collection.findOne({ hash: hash });
      if (checkDuplicate) {
        return hash;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      // fetch data from ipfs
      const data = await fetch(url + hash, { signal: controller.signal });
      console.log("fetched", hash)
      // timeout if it takes more than 30 seconds
      const contentType = await data.headers.get("content-type");
      if (contentType.includes("application/json")) {
        const json = await data.json();
        // json object might contain other hashes so we need to find them
        findIPFSHash(json);
        // upload json to db
        await uploadToDB(hash, json);
        return hash;
      } else if (mediaTypes.some((type) => contentType.includes(type))) {
        const blob = await data.blob();
        const fileName = hash + "." + contentType.split("/")[1];
        const file = new File([blob], fileName, {
          type: contentType,
          lastModified: Date.now(),
        });
        // upload file to s3
        const cid = await s3Upload(file, fileName);
        console.log(cid?.Location);
        if (!cid) return;
        await uploadToDB(hash, cid?.Location);
        return hash;
      } else {
        console.log("text type");
        const text = await data.text();
        await uploadToDB(hash, text);
        return hash;
      }
    } catch (error) {
      console.log(error);
      failedHashes.push(hash);
    }
  };
  let hashes = [];
  let hashData = await fs.readFileSync(hashFile);
  hashData = JSON.parse(hashData)?.hashes;
  if (hashData) {
    hashes = hashData;
  } else {
    console.log("no hashes");
  }
  const regex = new RegExp(
    "Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}"
  );
  function isIPFSHash(value) {
    return regex.test(value);
  }
  function findIPFSHash(obj) {
    function scanObject(obj) {
      for (const key in obj) {
        if (typeof obj[key] === "object") {
          scanObject(obj[key]);
        } else if (typeof obj[key] === "string" && isIPFSHash(obj[key])) {
          console.log(`Found IPFS Hash: ${obj[key]}`);
          // if the hash contains other letters
          // i.e: https://ipfs.questbook.app:8080/ipfs/QmdvRpyNzFoYRTYfZuHJruUfNyuhKJbB7aMTdHX4rPGq1k
          // extract the hash from the url and push it to the hashes array
          if (obj[key]?.includes("https://ipfs")) {
            const hash = obj[key]?.split("/")[4];
            if (!hashes.includes(hash)) {
              console.log("pushing", hash);
              hashes.push(hash);
            }
          } else {
            if (!hashes.includes(obj[key])) {
              console.log("pushing", obj[key]);
              hashes.push(obj[key]);
            }
          }
        }
      }
    }

    scanObject(obj);
  }

  while (hashes.length > 0) {
    const hash = hashes.pop();
    if (isIPFSHash(hash)) {
      console.log("Pending hashes", hashes.length)
      await fetchData(hash);
    }
  }
  // if there are failed hashes, write them to a file
  if (failedHashes.length > 0) {
    await fs.writeFileSync("./failedHashes.json", JSON.stringify(failedHashes));
  }
}

main()
  .catch(console.error)
  .finally(() => client.close());
