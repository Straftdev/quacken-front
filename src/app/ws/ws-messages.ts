/* eslint no-unused-vars: "off" */
export const enum Internal {
  Lobby = -100,
  MyBoat,
  ResetMoves,
  Time,
  ResetBoats,
  Boats,
  MyMoves,
  CenterOnBoat,
  BoatClicked,
  Scene,
  OpenAdvanced,
  SetMap,
}

export const enum OutCmd {
  InventoryCmd = 1,
  ChatCommand,

  SettingSet,
  SettingGetGroup,
  LobbyListJoin,
  EditorJoin,
  BnavJoin,
  LobbyJoin,

  FriendInvite,
  FriendDecline,
  FriendAdd,
  FriendRemove,
  Block,
  Unblock,

  MapList,
  CgMapList,
  StructureSetList,
  TileSetList,

  StatsUser,
  StatsTop,
  RanksUser,
  RanksTop,
  MatchesUser,
  GetWinLoss,
  MatchData,
  MatchAi,
  MatchScore,
  MatchTraining,

  ChangeEmail,
  ChangePass,
  ChangeName,
  SearchNames,
  SearchNamesOnline,

  LobbyCreate = 101,
  LobbyApply,
  ChatMessage,

  BnavGetPositions,
  BnavSavePosition,

  Moves,
  Shots,
  Bomb,
  Ready,
  NextBoat,
  SpawnSide,
  Team,
  WantMove,
  WantManeuver,
  Sync,

  MapListAll,
  MapGet,
  MapSave,
  MapCreate,
  MapDelete,
  TileSetGet,
  StructureSetGet,
  WeightSave,
  TMapSetGet,

  Sit,
  Kick,
  Jump,
  Bid,
  Card,
  DeclineBlind,

  ShuffleTeams,
  RateMap,
  SetMapData,
  SetMyJobbers,
  Vote,
}

export const enum InCmd {
  SessionId = 1,
  Copy,
  Kick,
  ChatMessage,
  NavigateTo,
  SettingSet,

  BlockUser,
  UnblockUser,
  FriendOnline,
  FriendOffline,
  FriendList,
  FriendAdd,
  FriendRemove,
  InviteAdd,
  InviteRemove,

  IntentoryOpen,
  InventoryCoin,
  InventoryUpdate,

  ChatCommands,
  Reload,

  LobbyUpdate = 101,
  LobbyList,
  LobbyRemove,
  PlayerAdd,
  PlayerList,
  PlayerRemove,
  LobbyStatus,

  LobbyJoin,
  Sync,
  NewBoat,
  DelBoat,
  Team,
  Turn,
  Moves,
  Bomb,
  Ready,
  BoatTick,
  BoatTicks,

  Bidding,
  Playing,
  Card,
  Cards,
  Sit,
  PlayTo,
  Take,
  Scores,
  Over,
  OfferBlind,
}
