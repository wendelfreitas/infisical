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
import { ConsumerSecretSecretSecureNote } from "@app/hooks/api/consumerSecrets/types";

export const SecureNoteTable = () => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const [searchSecrets, setSearchMemberFilter] = useState("");

  const { data, isLoading: isConsumerSecretsLoading } = useGetConsumerSecretsByOrgId({
    type: consumerSecretsTypes.secureNote,
    orgId
  });

  const secrets = (data || []) as unknown as ConsumerSecretSecretSecureNote[];

  const isLoading = isConsumerSecretsLoading;

  const filteredSecrets = useMemo(
    () =>
      secrets?.filter(
        (secret) =>
          secret.name?.toLowerCase().includes(searchSecrets.toLowerCase()) ||
          secret.content?.toLowerCase().includes(searchSecrets.toLowerCase())
      ),
    [secrets, searchSecrets]
  );

  return (
    <div>
      <Input
        value={searchSecrets}
        onChange={(e) => setSearchMemberFilter(e.target.value)}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search secure note..."
      />
      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Title</Th>
              <Th>Content</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} innerKey="org-members" />}
            {!isLoading &&
              filteredSecrets?.map((secret) => {
                const { content } = secret;
                return (
                  <Tr
                    key={`org-consumer-secret-${secret.id}`}
                    className="h-10 w-full cursor-pointer transition-colors duration-100 hover:bg-mineshaft-700"
                  >
                    <Td>{secret.name || "-"}</Td>
                    <Td className="max-w-xs truncate">{content}</Td>
                  </Tr>
                );
              })}
          </TBody>
        </Table>
        {!isLoading && filteredSecrets?.length === 0 && (
          <EmptyState
            title={secrets?.length === 0 ? "No secure note found" : "No secure note match search"}
          />
        )}
      </TableContainer>
    </div>
  );
};
