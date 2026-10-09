import type { ZipFile } from "./zip-file"

export class ZipFileHolder {
	private _zipFile?: ZipFile

	get zipFile() {
		return this._zipFile
	}

	set zipFile(zipFile: ZipFile | undefined) {
		this._zipFile = zipFile
	}
}
