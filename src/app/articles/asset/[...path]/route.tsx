import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import { lookup } from "mime-types";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const fullPath = params.path.join("/");

  const fileStat = await stat(decodeURIComponent(fullPath));

  const stream = createReadStream(fullPath);

  // @ts-expect-error type is not correct
  return new NextResponse(Readable.toWeb(stream), {
    headers: {
      "Content-Type": lookup(fullPath) || "application/octet-stream",
      "Content-Length": fileStat.size,
    },
  });
}

export async function generateStaticParams() {
  // visit all files in contents directory
  // and return an array of paths
  // that will be used as static paths
  // for the prerendering

  const paths: { path: string[] }[] = [];

  async function rec(dir: string[]) {
    const dirents = await readdir(dir.join("/"), { withFileTypes: true });

    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        await rec(dir.concat(dirent.name));
        continue;
      }

      // ignore md and summary json files
      if (dirent.name.endsWith(".md") || dirent.name.endsWith(".summary.json")) {
        continue;
      }

      paths.push({ path: dir.concat(dirent.name) });
    }
  }

  await rec(["contents"]);

  return paths;
}
