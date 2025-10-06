import { Festival } from "../../models/Festival";
import { FestivalResources, FormationDetails } from "../../models/ImportExportModel";

export async function getResourceFile(
  festival: Festival,
  onError: (msg: string) => void,
  onComplete: (resources: FestivalResources) => Promise<void>) {
  try {
    var resourceFileName = `${process.env.PUBLIC_URL}/data/festivals/${festival.id}/resources.json`;
    const resourceResponse = await fetch(resourceFileName);
    if (!resourceResponse.ok) {
      throw new Error(`Resource fetch failed with status: ${resourceResponse.status}`);
    }
    const data = (await resourceResponse.json() as FestivalResources);
    onComplete(data);
  } catch (err) {
    onError(`${festival.name}のリソースの取得に失敗しました。\n ${err}`);
    console.error('Resource fetch error:', err);
  }
}

export async function getFormationFile(
  festival: Festival,
  formationName: string,
  onError: (msg: string) => void,
  onComplete: (formation: FormationDetails) => Promise<void>) 
{
  try {
    var formationFileName = `${process.env.PUBLIC_URL}/data/festivals/${festival.id}/${formationName}.json`;
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
  festival: Festival,
  formationName: string,
  onError: (msg: string) => void,
  onComplete: (festival: Festival, resources: FestivalResources, formation: FormationDetails) => void) 
{
  await getResourceFile(festival, onError, async (resources) => {
    await getFormationFile(festival, formationName, onError, async (formation) => {
      onComplete(festival, resources, formation);
    });
  });
}  