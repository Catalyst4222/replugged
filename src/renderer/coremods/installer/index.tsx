import { Injector, Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import { ObjectExports } from "src/types";
import { registerRPCCommand } from "../rpc";
import { InstallResponse, InstallerSource, installFlow, isValidSource } from "./util";

const injector = new Injector();
const logger = Logger.coremod("Installer");

interface AnchorProps extends React.ComponentPropsWithoutRef<"a"> {
  useDefaultUnderlineStyles?: boolean;
  focusProps?: Record<string, unknown>;
}

interface InstallLinkProps {
  /** Identifier for the addon in the source */
  identifier: string;
  /** Updater source type */
  source?: InstallerSource;
  /** ID for the addon in that source. Useful for GitHub repositories that have multiple addons. */
  id?: string;
}

function parseInstallLink(href: string): InstallLinkProps | null {
  try {
    const url = new URL(href);
    if (url.hostname !== "replugged.dev") return null;
    if (url.pathname !== "/install") return null;
    const params = url.searchParams;
    const identifier = params.get("identifier");
    const source = params.get("source") ?? undefined;
    const id = params.get("id") ?? undefined;
    if (!identifier) return null;
    if (source !== undefined && !isValidSource(source)) return null;
    return {
      identifier,
      source,
      id,
    };
  } catch {
    return null;
  }
}

let uninjectFns: Array<() => void> = [];

const modalFlows = new Map<string, Promise<InstallResponse>>();

function injectRpc(): void {
  const uninjectRpc = registerRPCCommand("REPLUGGED_INSTALL", {
    scope: "REPLUGGED",
    handler: async (data) => {
      const { identifier, source, id } = data.args;
      if (typeof identifier !== "string") throw new Error("Invalid or missing identifier.");
      if (source !== undefined && typeof source !== "string") throw new Error("Invalid source.");
      if (id !== undefined && typeof id !== "string") throw new Error("Invalid id.");

      const cacheIdentifier = `${source}:${identifier}:${id ?? ""}`;
      if (modalFlows.has(cacheIdentifier)) {
        return await modalFlows.get(cacheIdentifier)!;
      }

      const res = installFlow(identifier, source as InstallerSource, id, false);

      modalFlows.set(cacheIdentifier, res);
      const ret = await res;
      modalFlows.delete(cacheIdentifier);
      return ret;
    },
  });

  uninjectFns.push(uninjectRpc);
}

async function injectLinks(): Promise<void> {
  const linkMod = await waitForModule(filters.bySource(".useDefaultUnderlineStyles"), {
    raw: true,
  });
  const exports = linkMod.exports as ObjectExports &
    Record<string, React.FC<React.PropsWithChildren<AnchorProps>>>;

  const key = getFunctionKeyBySource(exports, ".useDefaultUnderlineStyles");
  if (!key) {
    logger.error("Failed to find link component.");
    return;
  }

  injector.before(exports, key, ([args]) => {
    const { href } = args;
    if (!href) return undefined;
    const installLink = parseInstallLink(href);
    if (!installLink) return undefined;

    args.onClick = (e) => {
      e.preventDefault();
      void installFlow(installLink.identifier, installLink.source, installLink.id);
    };

    return [args] as [AnchorProps];
  });
}

export async function start(): Promise<void> {
  await injectLinks();
  injectRpc();
}

export function stop(): void {
  injector.uninjectAll();
  uninjectFns.forEach((fn) => fn());
}

export { installFlow };
