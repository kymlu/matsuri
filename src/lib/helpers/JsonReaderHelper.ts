import { Festival } from "../../models/Festival";
import { FestivalResources, FormationDetails } from "../../models/ImportExportModel";

export async function readFormationFromFiles(
  festival: Festival,
  formationName: string,
  onError: (msg: string) => void,
  onComplete: (festival: Festival, resources: FestivalResources, formation: FormationDetails) => void) 
{
  var resourceFileName = `${process.env.PUBLIC_URL}/data/festivals/${festival.id}/resources.json`;
  var formationFileName = `${process.env.PUBLIC_URL}/data/festivals/${festival.id}/${formationName}.json`;
  try {
    const resourceResponse = await fetch(resourceFileName);
    if (!resourceResponse.ok) {
      throw new Error(`Resource fetch failed with status: ${resourceResponse.status}`);
    }
    const data = (await resourceResponse.json() as FestivalResources);
    console.log(`Successfully fetched resources for ${festival.name}`);
    if (data.participants.length === 0) {
      throw new Error('参加者データが空です。');
    }
    
    try {
      const formationResponse = await fetch(formationFileName);
      if (!formationResponse.ok) {
        throw new Error(`Formation fetch failed with status: ${formationResponse.status}`);
      }
      
      const formation = (await formationResponse.json() as FormationDetails);
      console.log(`Successfully fetched formation ${formationName}`);
      if (formation.sections.length === 0) {
        throw new Error('隊列セクションデータが空です。');
      }

      onComplete(festival, data, formation);
    } catch (formationErr) {
      onError(`${formationName}の隊列データの取得に失敗しました。\n ${formationErr}`);
      console.error('Formation fetch error:', formationErr);
    }
  } catch (resourceErr) {
    onError(`${festival.name}のリソースの取得に失敗しました。\n ${resourceErr}`);
    console.error('Resource fetch error:', resourceErr);
  }
}