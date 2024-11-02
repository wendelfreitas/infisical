import { useMemo, useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EmptyState,
  Input,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { consumerSecretsTypes } from "@app/const";
import { useOrganization } from "@app/context";
import { useGetConsumerSecretsByOrgId } from "@app/hooks/api/consumerSecrets/queries";
import { ConsumerSecretSecretWebLogin } from "@app/hooks/api/consumerSecrets/types";

export const WebLoginTable = () => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const [searchMemberFilter, setSearchMemberFilter] = useState("");

  const { data, isLoading: isMembersLoading } = useGetConsumerSecretsByOrgId({
    type: consumerSecretsTypes.webLogin,
    orgId
  });

  const secrets = (data || []) as unknown as ConsumerSecretSecretWebLogin[];

  const isLoading = isMembersLoading;

  const filteredSecrets = useMemo(
    () =>
      secrets?.filter((secret) =>
        secret.name?.toLowerCase().includes(searchMemberFilter.toLowerCase())
      ),
    [secrets, searchMemberFilter]
  );

  return (
    <div>
      <Input
        value={searchMemberFilter}
        onChange={(e) => setSearchMemberFilter(e.target.value)}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search members..."
      />
      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Username</Th>
              <Th>Password</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} innerKey="org-members" />}
            {!isLoading &&
              filteredSecrets?.map((secret) => {
                const { username } = secret;
                return (
                  <Tr
                    key={`org-consumer-secret-${secret.id}`}
                    className="h-10 w-full cursor-pointer transition-colors duration-100 hover:bg-mineshaft-700"
                  >
                    <Td>{secret.name || "-"}</Td>
                    <Td>{username}</Td>
                    <Td>{"*".repeat(username.length)}</Td>
                  </Tr>
                );
              })}
          </TBody>
        </Table>
        {!isLoading && filteredSecrets?.length === 0 && (
          <EmptyState
            title={
              secrets?.length === 0
                ? "No web consumer secrets found"
                : "No web consumer secrets match search"
            }
            // icon={faUsers}
          />
        )}
      </TableContainer>
    </div>
  );
};
