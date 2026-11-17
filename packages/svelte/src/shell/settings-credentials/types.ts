import type {
  ApiCredential,
  AppPairing,
  AppPairingOutcome,
  CredentialScope,
  MintedCredential,
} from '../../data';
import type { ListingStore } from '../../primitives';

/**
 * How long a credential lasts, in days. The server refuses a date beyond the
 * maximum, and both bounds are named so the screen can say the whole range
 * rather than the end of it.
 */
export const CREDENTIAL_DAYS = { initial: 90, min: 1, max: 365 } as const;

/** A column of the listing. A reader puts any of them away. */
export type CredentialFieldId =
  'name' | 'scopes' | 'expires' | 'lastUsed' | 'created' | 'actions';

/** The name of each scope, as a person reads it. */
export const SCOPE_NAME: Record<CredentialScope, string> = {
  read: 'settingsCredentials.scope.read',
  operate: 'settingsCredentials.scope.operate',
  administer: 'settingsCredentials.scope.administer',
};

/** What each scope lets a credential do. */
export const SCOPE_NOTE: Record<CredentialScope, string> = {
  read: 'settingsCredentials.scope.read.note',
  operate: 'settingsCredentials.scope.operate.note',
  administer: 'settingsCredentials.scope.administer.note',
};

/**
 * The widest scope a list names. Each scope allows what the one before it
 * allows, so the widest one says everything the list says.
 */
export const widestScope = (
  scopes: readonly string[] | undefined,
): CredentialScope => {
  if (scopes?.includes('administer') === true) return 'administer';
  if (scopes?.includes('operate') === true) return 'operate';

  return 'read';
};

/** What the screen reads of the signed-in person's API credentials. */
export interface CredentialsSource {
  readonly items: readonly ApiCredential[];
  readonly loading: boolean;
  /** A read has answered, which tells an empty list from an unread one. */
  readonly loaded: boolean;
  /** The last refusal, as it was thrown. Drawn through `describeFault`. */
  readonly error: unknown;
  /** The credential just created, with its token in it. */
  readonly minted: MintedCredential | undefined;
}

export interface SettingsCredentialsScreenProps {
  credentials: CredentialsSource;
  /**
   * The reader named a new credential and chose how many days it lasts, within
   * `CREDENTIAL_DAYS`. What creating one performs is the caller's.
   */
  onCreate: (name: string, days: number, scope: CredentialScope) => void;
  /** The reader is done with the token on screen, or left the screen, so the copy is dropped. */
  onDismiss: () => void;
  /** The reader confirmed a revocation. */
  onRevoke: (credential: ApiCredential) => void;
  /** Where a person approves an app that asked for a credential. */
  pairHref: string;
  /**
   * The address that opens EasyPrint with this server's address in it, from
   * `easyPrintPairHref`. Absent where nothing knows the address a browser
   * reaches this server on, and the link is then not drawn.
   */
  easyPrintHref?: string | undefined;
  /** Where the columns, the shape and the page size are kept between visits. */
  store?: ListingStore;
}

/** What the pairing page reads of the pairing a code names. */
export interface AppPairingSource {
  /** The code the person typed or the link carried. */
  readonly code: string;
  readonly pairing: AppPairing | undefined;
  readonly loading: boolean;
  /** A read has answered, which tells a code nobody typed from one nothing answers. */
  readonly loaded: boolean;
  /** The last refusal, as it was thrown. Drawn through `describeFault`. */
  readonly error: unknown;
  /** True while an approval or a denial is on its way. */
  readonly deciding: boolean;
  /** What the person decided, once the server took it. */
  readonly outcome: AppPairingOutcome | undefined;
}

export interface AppPairingScreenProps {
  review: AppPairingSource;
  /** The person typed a code and asked for the pairing it names. */
  onLookup: (code: string) => void;
  /** The person approved the pairing with one scope, the asked one or narrower. */
  onApprove: (scope: CredentialScope) => void;
  /** The person refused the app its credential. */
  onDeny: () => void;
  /** Where the person's own credentials are listed, the paired apps among them. */
  credentialsHref: string;
}
