export const enum Internal {
  Lobby = -100,
  MyBoat,
  UnlockMoves,
  Time,
  RefreshChat,
  ResetBoats,
  Boats,
  MyMoves,
  CenterOnBoat,
  BoatClicked,
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
  MatchData,

  ChangeEmail,
  ChangePass,
  ChangeName,
  SearchNames,

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

  LobbyUpdate = 101,
  LobbyList,
  LobbyRemove,
  PlayerAdd,
  PlayerList,
  PlayerRemove,

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
  Score,
  Scores,
  Over,
  OfferBlind,
}
