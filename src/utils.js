import { unlink } from "fs/promises";

// ---------- Remove file ---------- //

export async function removeFile(path) {
  try {
    await unlink(path);
  } catch (error) {
    console.log("Error removing files", error.message);
  }
}
