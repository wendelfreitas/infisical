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
import { ConsumerSecretSecureNote } from "@app/hooks/api/consumerSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";
import { handleCopySecretToClipboard } from "@app/views/UserSecretsPage/utils/helpers/copy-secret-to-clipboard";

type SecureNoteTableProps = {
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["removeConsumerSecret", "editConsumerSecret"]>,
    data?: {
      id: string;
      type: ConsumerSecretType;
    }
  ) => void;
};

export const SecureNoteTable = ({ handlePopUpOpen }: SecureNoteTableProps) => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const [searchSecrets, setSearchMemberFilter] = useState("");

  const { data, isLoading: isConsumerSecretsLoading } = useGetConsumerSecretsByOrgId({
    type: consumerSecretsTypes.secureNote,
    orgId
  });

  const secrets = (data || []) as unknown as ConsumerSecretSecureNote[];

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
              <Th aria-label="button" className="w-10" />
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
                    <Td className="flex">
                      <Tooltip content="Copy content">
                        <IconButton
                          ariaLabel="copy-value"
                          onClick={() => handleCopySecretToClipboard(content)}
                          variant="plain"
                          className="mr-2 h-full"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </IconButton>
                      </Tooltip>
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

                      <Tooltip content="Delete note">
                        <IconButton
                          onClick={async (e) => {
                            e.stopPropagation();

                            handlePopUpOpen("removeConsumerSecret", {
                              type: consumerSecretsTypes.secureNote,
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
            title={secrets?.length === 0 ? "No secure note found" : "No secure note match search"}
          />
        )}
      </TableContainer>
    </div>
  );
};
