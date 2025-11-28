import { Festival } from "../../models/Festival";
import { FestivalMeta, FestivalResources, FormationDetails } from "../../models/ImportExportModel.ts";

export async function getFestivalMetaFile(
  festival: FestivalMeta,
  onError: (msg: string) => void,
  onComplete: (data: Festival) => Promise<void>): Promise<Festival | undefined> {
  try {
    console.log('Fetching festival meta file for', festival.id);
    var resourceFileName = `${process.env.PUBLIC_URL}/data/festivals/${festival.id}/festival.json`;
    const resourceResponse = await fetch(resourceFileName);
    if (!resourceResponse.ok) {
      throw new Error(`Resource fetch failed with status: ${resourceResponse.status}`);
    }
    const data = (await resourceResponse.json() as Festival);
    onComplete(data);
    return data;
  } catch (err) {
    onError(`${festival.id}のリソースの取得に失敗しました。\n ${err}`);
    console.error('Resource fetch error:', err);
  }
}

export async function getResourceFile(
  festivalId: string,
  onError: (msg: string) => void,
  onComplete: (resources: FestivalResources) => Promise<void>) {
  try {
    console.log('Fetching resource file for', festivalId);
    var resourceFileName = `${process.env.PUBLIC_URL}/data/festivals/${festivalId}/resources.json`;
    const resourceResponse = await fetch(resourceFileName);
    if (!resourceResponse.ok) {
      throw new Error(`Resource fetch failed with status: ${resourceResponse.status}`);
    }
    const data = (await resourceResponse.json() as FestivalResources);
    onComplete(data);
  } catch (err) {
    onError(`${festivalId}のリソースの取得に失敗しました。\n ${err}`);
    console.error('Resource fetch error:', err);
  }
}

export async function getFormationFile(
  festivalId: string,
  formationName: string,
  onError: (msg: string) => void,
  onComplete: (formation: FormationDetails) => Promise<void>) 
{
  try {
    console.log('Fetching formation file for', { festivalId, formationName });
    var formationFileName = `${process.env.PUBLIC_URL}/data/festivals/${festivalId}/${formationName}.json`;
    const formationResponse = await fetch(formationFileName);
    if (!formationResponse.ok) {
      throw new Error(`Formation fetch failed with status: ${formationResponse.status}`);
    }
    const formation = (await formationResponse.json() as FormationDetails);
    onComplete(formation);
  } catch (err) {
    onError(`${formationName}の隊列データの取得に失敗しました。\n ${err}`);
    console.error('Formation fetch error:', err);
  }
}

export async function readResourcesAndFormation(
  festivalId: string,
  formationName: string,
  onError: (msg: string) => void,
  onComplete: (resources: FestivalResources, formation: FormationDetails) => void) 
{
  await getResourceFile(festivalId, onError, async (resources) => {
    await getFormationFile(festivalId, formationName, onError, async (formation) => {
      onComplete(resources, formation);
    });
  });
}