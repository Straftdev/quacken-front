export const enum Internal {
    Boats = -100,
    MyBoat,
    UnlockMoves,
    OpenMenu,
    Time
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
    LobbyInvite,
    SettingSet,

    BlockUser,
    UnblockUser,
    FriendOnline,
    FriendOffline,
    FriendList,
    FriendInvite,
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
