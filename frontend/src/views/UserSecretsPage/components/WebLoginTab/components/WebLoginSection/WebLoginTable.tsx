import { useMemo, useState } from "react";
import { faCopy, faMagnifyingGlass, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EmptyState,
  IconButton,
  Input,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tooltip,
  Tr
} from "@app/components/v2";
import { consumerSecretsTypes, ConsumerSecretType } from "@app/const";
import { useOrganization } from "@app/context";
import { useGetConsumerSecretsByOrgId } from "@app/hooks/api/consumerSecrets/queries";
import { ConsumerSecretWebLogin } from "@app/hooks/api/consumerSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";
import { handleCopySecretToClipboard } from "@app/views/UserSecretsPage/utils/helpers/copy-secret-to-clipboard";

type WebLoginTableProps = {
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["removeConsumerSecret", "editConsumerSecret"]>,
    data?: {
      id: string;
      type: ConsumerSecretType;
    }
  ) => void;
};

export const WebLoginTable = ({ handlePopUpOpen }: WebLoginTableProps) => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const [serachSecrets, setSearchMemberFilter] = useState("");

  const { data, isLoading: isConsumerSecretsLoading } = useGetConsumerSecretsByOrgId({
    type: consumerSecretsTypes.webLogin,
    orgId
  });

  const secrets = (data || []) as unknown as ConsumerSecretWebLogin[];

  const isLoading = isConsumerSecretsLoading;

  const filteredSecrets = useMemo(
    () =>
      secrets?.filter((secret) => secret.name?.toLowerCase().includes(serachSecrets.toLowerCase())),
    [secrets, serachSecrets]
  );

  return (
    <div>
      <Input
        value={serachSecrets}
        onChange={(e) => setSearchMemberFilter(e.target.value)}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search credentials..."
      />
      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Username</Th>
              <Th>Password</Th>
              <Th aria-label="button" className="w-10" />
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} innerKey="org-members" />}
            {!isLoading &&
              filteredSecrets?.map((secret) => {
                const { username, password } = secret;
                return (
                  <Tr
                    key={`org-consumer-secret-${secret.id}`}
                    className="h-10 w-full cursor-pointer transition-colors duration-100 hover:bg-mineshaft-700"
                  >
                    <Td>{secret.name || "-"}</Td>
                    <Td>
                      {username}{" "}
                      <Tooltip content="Copy username">
                        <IconButton
                          ariaLabel="copy-value"
                          onClick={() => handleCopySecretToClipboard(username)}
                          variant="plain"
                          className="h-full"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </IconButton>
                      </Tooltip>
                    </Td>
                    <Td>
                      {"*".repeat(password.length)}{" "}
                      <Tooltip content="Copy password">
                        <IconButton
                          ariaLabel="copy-value"
                          onClick={() => handleCopySecretToClipboard(password)}
                          variant="plain"
                          className="h-full"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </IconButton>
                      </Tooltip>
                    </Td>
                    <Td className="flex">
                      <Tooltip content="Edit credentials">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePopUpOpen("editConsumerSecret", secret);
                          }}
                          variant="plain"
                          ariaLabel="edit"
                          className="mr-2.5"
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete credentials">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePopUpOpen("removeConsumerSecret", {
                              type: consumerSecretsTypes.webLogin,
                              id: secret.id
                            });
                          }}
                          variant="plain"
                          ariaLabel="delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </IconButton>
                      </Tooltip>
                    </Td>
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
          />
        )}
      </TableContainer>
    </div>
  );
};
