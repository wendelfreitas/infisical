import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Tab, TabList, TabPanel, Tabs } from "@app/components/v2";
import { OrgPermissionActions, OrgPermissionSubjects } from "@app/context";
import { withPermission } from "@app/hoc";
import { isTabSection } from "@app/views/Org/Types";

import { WebLoginTab } from "./components";

const TAB_SECTIONS = {
  WEB_LOGIN: "web-login",
  CREDIT_CARD: "credit-card",
  SECURE_NOTE: "secure-note"
};

export const UserSecretsPage = withPermission(
  () => {
    const router = useRouter();
    const { query } = router;
    const selectedTab = query.selectedTab as string;
    const [activeTab, setActiveTab] = useState<string>(TAB_SECTIONS.WEB_LOGIN);

    useEffect(() => {
      if (selectedTab) {
        setActiveTab(selectedTab);
      }
    }, [isTabSection, selectedTab]);

    const updateSelectedTab = (tab: string) => {
      router.push({
        query: { ...router.query, selectedTab: tab }
      });
    };

    const tabs = [
      {
        title: "Web Login",
        value: "web-login"
      },
      {
        title: "Credit Card",
        value: "credit-card"
      },
      {
        title: "Secure Note",
        value: "secure-note"
      }
    ];

    return (
      <div className="container mx-auto flex flex-col justify-between bg-bunker-800 text-white">
        <div className="mx-auto mb-6 w-full max-w-7xl py-6 px-6">
          <h2 className="text-3xl font-semibold text-gray-200">User Secrets</h2>
          <p className="mb-4 text-bunker-300">
            Manage consumer secrets securely, from website logins to corporate credit cards.
          </p>
          <Tabs value={activeTab} onValueChange={updateSelectedTab}>
            <TabList>
              {tabs.map((tab) => (
                <Tab key={tab.value} value={tab.value}>
                  {tab.title}
                </Tab>
              ))}
            </TabList>
            <TabPanel value={TAB_SECTIONS.WEB_LOGIN}>
              <WebLoginTab />
            </TabPanel>
            {/* <TabPanel value={TAB_SECTIONS.CREDIT_CARD}>
              <OrgIdentityTab />
            </TabPanel>
            <TabPanel value={TAB_SECTIONS.SECURE_NOTE}>
              <OrgRoleTabSection />
            </TabPanel> */}
          </Tabs>
        </div>
      </div>
    );
  },
  { action: OrgPermissionActions.Read, subject: OrgPermissionSubjects.Member }
);
