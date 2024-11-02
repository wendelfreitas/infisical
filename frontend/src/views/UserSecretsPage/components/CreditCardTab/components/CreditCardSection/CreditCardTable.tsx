import { useMemo, useState } from "react";
import { faCopy, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
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
import { consumerSecretsTypes } from "@app/const";
import { useOrganization } from "@app/context";
import { useGetConsumerSecretsByOrgId } from "@app/hooks/api/consumerSecrets/queries";
import { ConsumerSecretSecretCreditCard } from "@app/hooks/api/consumerSecrets/types";
import { handleCopySecretToClipboard } from "@app/views/UserSecretsPage/utils/helpers/copy-secret-to-clipboard";

export const CreditCardTable = () => {
  const { currentOrg } = useOrganization();
  const orgId = currentOrg?.id || "";

  const [searchSecrets, setSearchMemberFilter] = useState("");

  const { data, isLoading: isConsumerSecretsLoading } = useGetConsumerSecretsByOrgId({
    type: consumerSecretsTypes.creditCard,
    orgId
  });

  const secrets = (data || []) as unknown as ConsumerSecretSecretCreditCard[];

  const isLoading = isConsumerSecretsLoading;

  const filteredSecrets = useMemo(
    () =>
      secrets?.filter((secret) => secret.name?.toLowerCase().includes(searchSecrets.toLowerCase())),
    [secrets, searchSecrets]
  );

  function getCreditCardFormatted(number: number) {
    const cleaned = String(number).replace(/\D/g, "");

    const masked = cleaned.slice(0, -3).replace(/\d/g, "*") + cleaned.slice(-4);

    return masked.replace(/(.{4})/g, "$1 ").trim();
  }

  return (
    <div>
      <Input
        value={searchSecrets}
        onChange={(e) => setSearchMemberFilter(e.target.value)}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search credit card..."
      />
      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Card Number</Th>
              <Th>Expiry Date</Th>
              <Th>CVV</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} innerKey="org-members" />}
            {!isLoading &&
              filteredSecrets?.map((secret) => {
                const { cardNumber, expiryDate, cvv } = secret;
                return (
                  <Tr
                    key={`org-consumer-secret-${secret.id}`}
                    className="h-10 w-full cursor-pointer transition-colors duration-100 hover:bg-mineshaft-700"
                  >
                    <Td>{secret.name || "-"}</Td>
                    <Td>
                      {getCreditCardFormatted(Number(cardNumber))}{" "}
                      <Tooltip content="Copy card number">
                        <IconButton
                          ariaLabel="copy-value"
                          onClick={() => handleCopySecretToClipboard(cardNumber)}
                          variant="plain"
                          className="h-full"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </IconButton>
                      </Tooltip>
                    </Td>
                    <Td>{expiryDate}</Td>
                    <Td>{cvv}</Td>
                  </Tr>
                );
              })}
          </TBody>
        </Table>
        {!isLoading && filteredSecrets?.length === 0 && (
          <EmptyState
            title={secrets?.length === 0 ? "No credit card found" : "No credit card match search"}
          />
        )}
      </TableContainer>
    </div>
  );
};
