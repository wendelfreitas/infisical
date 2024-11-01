import { useMemo, useState } from "react";

import {
  EmptyState,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { useOrganization } from "@app/context";
import { useGetOrgRoles, useGetOrgUsers } from "@app/hooks/api";

export const WebLoginTable = () => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const { isLoading: isRolesLoading } = useGetOrgRoles(orgId);

  const [searchMemberFilter] = useState("");

  const { data: members, isLoading: isMembersLoading } = useGetOrgUsers(orgId);

  const isLoading = isMembersLoading || isRolesLoading;

  const filterdUser = useMemo(
    () =>
      members?.filter(
        ({ user: u, inviteEmail }) =>
          u?.firstName?.toLowerCase().includes(searchMemberFilter.toLowerCase()) ||
          u?.lastName?.toLowerCase().includes(searchMemberFilter.toLowerCase()) ||
          u?.username?.toLowerCase().includes(searchMemberFilter.toLowerCase()) ||
          u?.email?.toLowerCase().includes(searchMemberFilter.toLowerCase()) ||
          inviteEmail?.includes(searchMemberFilter.toLowerCase())
      ),
    [members, searchMemberFilter]
  );

  return (
    <div>
      {/* <Input
        value={searchMemberFilter}
        onChange={(e) => setSearchMemberFilter(e.target.value)}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search members..."
      /> */}
      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>DESCRIPTION</Th>
              <Th>Username</Th>
              <Th>Password</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} innerKey="org-members" />}
            {!isLoading &&
              filterdUser?.map(({ user: u, inviteEmail, id: orgMembershipId, isActive }) => {
                const username = u?.username ?? inviteEmail ?? "-";
                return (
                  <Tr
                    key={`org-membership-${orgMembershipId}`}
                    className="h-10 w-full cursor-pointer transition-colors duration-100 hover:bg-mineshaft-700"
                  >
                    <Td className={isActive ? "" : "text-mineshaft-400"}>Sentry</Td>
                    <Td className={isActive ? "" : "text-mineshaft-400"}>testes</Td>
                    <Td className={isActive ? "" : "text-mineshaft-400"}>wendel@infisical.com</Td>
                    <Td>{"*".repeat(username.length)}</Td>
                  </Tr>
                );
              })}
          </TBody>
        </Table>
        {!isLoading && filterdUser?.length === 0 && (
          <EmptyState
            title={
              members?.length === 0
                ? "No organization members found"
                : "No organization members match search"
            }
            // icon={faUsers}
          />
        )}
      </TableContainer>
    </div>
  );
};
