export declare const AUCTION_SYNC_TRIGGER_QUEUE = "auctions.sync.trigger";
export type AuctionSyncTriggerMessage = {
    kind: 'copart-import';
} | {
    kind: 'copart-import-recreate';
} | {
    kind: 'reindex-copart';
} | {
    kind: 'reindex-all';
} | {
    kind: 'recreate-index';
};
