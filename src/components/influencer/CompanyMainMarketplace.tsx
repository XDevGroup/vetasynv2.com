import Image from "next/image";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { playlists } from "@/helpers/playlists";
import Link from "next/link";
import db from "../../../drizzle/db";
import { companyProfiles } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { Listings } from "../types/Listings";

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  listings: Listings;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
}

const getCompany = async (email: string) => {
  const response = await db
    .select()
    .from(companyProfiles)
    .where(eq(companyProfiles.email, email));
  return response[0];
};

export async function CompanyMainMarketplace({
  listings,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: AlbumArtworkProps) {
  const company = await getCompany(listings.email as string);
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">
            {company.image ? (
              <Link href={`/dashboard/campaigns/listings/${listings.id}`}>
                <Image
                  src={company?.image as string}
                  alt={company?.alias as string}
                  width={width}
                  height={height}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait"
                      ? "aspect-[3/4]"
                      : "aspect-square"
                  )}
                />
              </Link>
            ) : (
              <Link href={`/marketplace/companies/${listings.id}`}>
                <Image
                  src={"/veta-template.jpg"}
                  alt={company?.alias as string}
                  width={width}
                  height={height}
                  className={cn(
                    "h-auto w-auto object-cover transition-all hover:scale-105",
                    aspectRatio === "portrait"
                      ? "aspect-[3/4]"
                      : "aspect-square"
                  )}
                />
              </Link>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>Add to Library</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <PlusCircledIcon className="mr-2 h-4 w-4" />
                New Playlist
              </ContextMenuItem>
              <ContextMenuSeparator />
              {playlists.map((playlist) => (
                <ContextMenuItem key={playlist}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                  </svg>
                  {playlist}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>Play Next</ContextMenuItem>
          <ContextMenuItem>Play Later</ContextMenuItem>
          <ContextMenuItem>Create Station</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Like</ContextMenuItem>
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{listings?.title}</h3>
        <p className="text-xs text-muted-foreground capitalize">Campaign</p>
      </div>
    </div>
  );
}
