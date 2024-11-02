import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@app/components/v2";
import { consumerSecretsTypes } from "@app/const";
import { usePopUp } from "@app/hooks/usePopUp";

import { AddConsumerSecretModal } from "../../../AddConsumerSecretModal/AddConsumerSecretModal";
import { CreditCardTable } from "./CreditCardTable";

export const CreditCardSection = () => {
  const { popUp, handlePopUpOpen, handlePopUpToggle } = usePopUp(["createConsumerSecret"] as const);

  const handleAddMemberModal = () => {
    handlePopUpOpen("createConsumerSecret");
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Credit Cards</p>

        <Button
          colorSchema="primary"
          type="submit"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => handleAddMemberModal()}
        >
          Add Credit Card
        </Button>
      </div>
      <CreditCardTable />
      <AddConsumerSecretModal
        type={consumerSecretsTypes.creditCard}
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
      />
    </div>
  );
};
