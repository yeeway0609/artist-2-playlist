export enum AlbumType {
  Album = 'album',
  Single = 'single',
  AppearsOn = 'appears_on',
  Compilation = 'compilation',
}

export enum AlbumOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export enum ProcessingStatus {
  Idle = 'idle',
  Processing = 'processing',
  Saving = 'saving',
  Done = 'done',
}

export enum OrganizerMode {
  Create = 'create',
  Upsert = 'upsert',
  Edit = 'edit',
}

export enum TrackSortKey {
  ReleaseAsc = 'release_asc',
  ReleaseDesc = 'release_desc',
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  Custom = 'custom',
}

export enum MatchStrategy {
  ById = 'id',
  ByName = 'name',
}
