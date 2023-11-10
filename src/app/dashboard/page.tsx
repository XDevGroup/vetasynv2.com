import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/ui/overview";
import { RecentSales } from "@/components/ui/recent-sales";
import DashboardHeader from "@/components/dashboard-header";
import Stripe from "stripe";
import { Session, getServerSession } from "next-auth";
import Link from "next/link";
import db from "../../../drizzle/db";
import { campaignMessages, companyProfiles, influencerProfiles, listings, users } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

const getRole = async () => {
  const session = await getServerSession();
  const role = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, session?.user?.email as string));
  return role[0]?.role;
};

const getBalance = async (session: Session) => {
  const stripe = new Stripe(
    "***REMOVED***",
    {
      apiVersion: "2023-10-16",
    }
  );
  const user = await db
    .select({ stripe_id: users?.stripe_id })
    .from(users)
    .where(eq(users.email, session?.user?.email as string));

  const response: any = await stripe.customers.retrieve(
    `${user[0]?.stripe_id}`
  );

  const balance = response?.balance;

  return balance;
};

const getListingAmount = async (session: Session): Promise<number> => {
  const response = await db.select({ id: listings.id }).from(listings).where(eq(listings.email, session.user?.email as string))
  const length = response.length
  return length
}

const getProfileID = async (session: Session) => {
  const response = await db
    .select({ id: companyProfiles.id })
    .from(companyProfiles)
    .where(eq(companyProfiles.email, session?.user?.email as string));
  return response[0].id
}

const getSenderInfo = async (response: { id: string }[]) => {
  let array = []
  for (let i = 0; i < response.length; i++){
  const data = await db.select({ id: influencerProfiles.id, alias: influencerProfiles.alias, email: influencerProfiles.email, image: influencerProfiles.image }).from(influencerProfiles).where(eq(influencerProfiles.id, response[i].id as string))
  array.push(data[0])
  }
  return array.reverse()
  }

const getApplicants = async (session: Session) => {
  const id = await getProfileID(session)
  const response = await db.select({ id: campaignMessages.senderId }).from(campaignMessages).where(eq(campaignMessages.receiverId, id as string))
  const sender = await getSenderInfo(response as any)
  return { length: response.length, applicants: sender }
}


export default async function DashboardPage() {
  const session = await getServerSession();
  const balance = await getBalance(session as Session);
  const role = await getRole();
  const listingAmount = await getListingAmount(session as Session)
  const applicantInfo = await getApplicants(session as Session)
  return (
    <>
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            {/* <DatePickerWithRange /> */}
            <Link href={"/dashboard/marketplace"}>
              {role === "influencer" && <Button>Find campaigns</Button>}
              {role === "company" && <Button>Find influencers</Button>}
            </Link>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My balance
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${balance?.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    My stripe balance
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Connections
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{applicantInfo.length}</div>
                  <p className="text-xs text-muted-foreground">
                    My applicants
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Listings
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{listingAmount}</div>
                  <p className="text-xs text-muted-foreground">My listings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active campaigns
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+1</div>
                  <p className="text-xs text-muted-foreground">
                    My active campaigns
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>New applicants</CardTitle>
                  <CardDescription>
                    People that may want to join your campaigns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales applicants={applicantInfo.applicants as any} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
