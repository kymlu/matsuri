import React, { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext.tsx";
import { strEquals } from "../../lib/helpers/GlobalHelper.ts";
import CustomDialog from "./CustomDialog.tsx";
import Button from "../Button.tsx";
import { Formation } from "../../models/Formation.ts";
import { getAll } from "../../data/DataRepository.ts";
import { groupByKey } from "../../lib/helpers/GroupingHelper.ts";
import { EntitiesContext } from "../../contexts/EntitiesContext.tsx";
import { songList } from "../../data/ImaHitotabi.ts";
import { Song } from "../../models/Song.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { Participant } from "../../models/Participant.ts";

export function CompareFormationDialog() {
  const { selectedFestival } = React.useContext(UserContext);
  const { participantList } = useContext(EntitiesContext);
  const { participantPositions } = useContext(PositionContext);

  // formations grouped by songId
  const [ formationsBySong, setFormationsBySong ] = React.useState<Record<string, Formation[]>>({});
  const [ songsInFestival, setSongsInFestival ] = React.useState<Record<string, Song>>({});
  const [ selectedSong, setSelectedSong ] = React.useState<Song | null>(null);

  // categories grouped by formationId -> participantId -> Set<categoryId>
  const [ groupedCategories, setGroupedCategories ] = React.useState<Record<string, Record<string, Set<string>>>>({});
  const [ visibleParticipantList, setVisibleParticipantList ] = React.useState<Array<Participant>>([]);

  useEffect(() => {
    if (selectedFestival) {
      setFormationsBySong(groupByKey(Object.values(selectedFestival.formations), "songId"));

      var songs = new Set(selectedFestival.formations.map(f => f.songId));
      var festivalSongs = Object.fromEntries(Object.entries(songList).filter(([key]) => songs.has(key)));
      setSongsInFestival(festivalSongs);
      var selectedSong = Object.values(festivalSongs)[0];
      setSelectedSong(selectedSong);

      Promise.all([
        getAll("participantPosition"),
        getAll("formationSection"),
      ]).then(([allPositions, formationSections]) => {
        allPositions = allPositions
          .sort((a, b) => participantList[a.participantId].displayName.localeCompare(participantList[b.participantId].displayName));

        var groupedSections = groupByKey(formationSections, "formationId");
        var categoriesByParticipantByFormation: Record<string, Record<string, Set<string>>> = {};
        Object.entries(groupedSections).forEach(([formationId, sectionList]) => {
          var positions = allPositions.filter((pos) => sectionList.some(sec => strEquals(sec.id, pos.formationSectionId)));
          var positionsByParticipant = groupByKey(positions, "participantId");
          categoriesByParticipantByFormation[formationId] = {};
          var categoryDict = songList[selectedFestival.formations.find(x => strEquals(x.id, formationId))?.songId ?? ""]?.categories ?? {};
          Object.entries(positionsByParticipant).forEach(([participantId, posList]) => {
            categoriesByParticipantByFormation[formationId][participantId] = new Set(
              posList.filter(p => p.categoryId !== null && p.categoryId !== undefined)
                .map(p => p.categoryId!)
                .sort((a, b) => categoryDict[a].order - categoryDict[b].order)
              );
          });
        });
        setGroupedCategories(categoriesByParticipantByFormation);
        refreshParticipantList(selectedSong.id);
      });
    } else {
      setFormationsBySong({});
      setSongsInFestival({});
    }
  }, [selectedFestival, participantList, participantPositions]);

  const changeSelectedSong = (songId: string) => {
    setSelectedSong(songsInFestival[songId] ?? null);
  }

  const refreshParticipantList = (songId?: string) => {
    if (songId === null) {
      songId = selectedSong?.id;
    }

    if (songId == null) return;

    var newParticipantList: Array<Participant> = [];
    var categoriesPerParticipant: Record<string, Array<string>> = {};
    
    formationsBySong[songId]?.forEach(formation => {
      if (groupedCategories[formation.id]) {
        Object.entries(groupedCategories[formation.id])?.forEach(([participantId, categorySet]) => {
          categoriesPerParticipant[participantId] = [...(categoriesPerParticipant[participantId] ?? []), ...(Array.from(categorySet))];
        });
      }
    });
    
    Object.keys(participantList)?.forEach(participantId => {
      if (categoriesPerParticipant[participantId]?.length > 0) {
        newParticipantList.push(participantList[participantId]);
      }
    });
    
    newParticipantList = newParticipantList.sort((a, b) => a.displayName.localeCompare(b.displayName));
    setVisibleParticipantList(newParticipantList);
  }

  useEffect(() => {
    refreshParticipantList(selectedSong?.id);
  }, [participantList, selectedSong, formationsBySong, groupedCategories]);

  return (
    <CustomDialog
      title="隊列比較"
      hasX>
      <div className="flex flex-col gap-2 max-w-[80svw] w-[80svw]">
        <div className="flex flex-row gap-1">
          {
            Object.entries(songsInFestival)
              .sort((a, b) => a[1].order - b[1].order)
              .map(([id, song]) =>
              <Button key={id} primary={strEquals(id, selectedSong?.id)} onClick={() => changeSelectedSong(song.id)}>
                {song.name}
              </Button>
            )
          }
        </div>
        <table className="border">
          <thead>
            <tr>
              <th className="p-2 border bg-slate-100">
                参加者名
              </th>
              {
                selectedSong && 
                formationsBySong[selectedSong.id]?.map(formation => 
                  <th key={formation.id} className="p-2 border bg-slate-100">
                    {formation.name}
                  </th> 
                )
              }
            </tr>
          </thead>
          <tbody>
            {
              selectedSong &&
              visibleParticipantList.map((participant) => 
                <tr key={participant.id}>
                  <th scope="row" className="p-2 border">{participant.displayName}</th>
                  {
                    formationsBySong[selectedSong.id]?.map(formation => 
                      <td key={formation.id} className="p-2 border">
                        <div className="flex flex-row flex-wrap gap-2">
                          {
                            groupedCategories[formation.id]?.[participant.id] &&
                            Array.from(groupedCategories[formation.id]?.[participant.id])?.map(category => 
                              <span
                                key={category}
                                className="px-2 py-1 text-sm border-2 rounded-full"
                                style={{
                                  backgroundColor: selectedSong.categories[category]?.color.bgColour ?? "",
                                  borderColor: selectedSong.categories[category]?.color.borderColour ?? "",
                                  color: selectedSong.categories[category]?.color.textColour ?? ""
                                }}>
                                { selectedSong.categories[category]?.name }
                              </span>
                            )
                          }
                        </div>
                      </td>
                    )
                  }
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </CustomDialog>
  )
}