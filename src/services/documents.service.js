import { documentsMock } from "../mocks/documents.mock";

export async function getDocumentsMockData() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(documentsMock);
		}, 1000);
	});
}