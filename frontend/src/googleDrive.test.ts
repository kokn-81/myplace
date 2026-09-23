import assert from "node:assert/strict";
import test from "node:test";

import { isDriveMedia, parseDriveLink } from "./googleDrive";

test("parsea carpeta y archivo de Drive", () => {
  assert.deepEqual(
    parseDriveLink("https://drive.google.com/drive/folders/1WaAUQYiRMRwUzy8LU81YFtKtPHZwGBGW"),
    { kind: "folder", id: "1WaAUQYiRMRwUzy8LU81YFtKtPHZwGBGW" },
  );
  assert.deepEqual(
    parseDriveLink("https://drive.google.com/file/d/1lYm01fS2XrlxqC1Ls8c0uKPYgRrtiWG_/view?usp=drivesdk"),
    { kind: "file", id: "1lYm01fS2XrlxqC1Ls8c0uKPYgRrtiWG_" },
  );
  assert.equal(parseDriveLink("https://example.com/nope"), null);
});

test("solo imagenes y videos cuentan como media", () => {
  assert.equal(isDriveMedia("image/jpeg"), true);
  assert.equal(isDriveMedia("video/mp4"), true);
  assert.equal(isDriveMedia("application/pdf"), false);
  assert.equal(isDriveMedia("application/vnd.google-apps.folder"), false);
});
