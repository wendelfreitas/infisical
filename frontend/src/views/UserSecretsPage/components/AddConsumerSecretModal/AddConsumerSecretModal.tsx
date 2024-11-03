import { Modal, ModalContent } from "@app/components/v2";
import { consumerSecretsTypes, ConsumerSecretType } from "@app/const";
import { ConsumerSecret } from "@app/hooks/api/consumerSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { ConsumerSecretForm } from "../ConsumerSecretForm/ConsumerSecretForm";

type Props = {
  type: ConsumerSecretType;
  popUp: UsePopUpState<["createConsumerSecret", "editConsumerSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createConsumerSecret", "editConsumerSecret"]>,
    state?: boolean
  ) => void;
};

export const AddConsumerSecretModal = ({ type, popUp, handlePopUpToggle }: Props) => {
  const title = {
    [consumerSecretsTypes.webLogin]: "Web login",
    [consumerSecretsTypes.creditCard]: "Credit Card",
    [consumerSecretsTypes.secureNote]: "Secure Note"
  };

  return (
    <Modal
      isOpen={popUp?.createConsumerSecret?.isOpen || popUp?.editConsumerSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createConsumerSecret", isOpen);

        if (popUp?.editConsumerSecret?.isOpen) {
          handlePopUpToggle("editConsumerSecret", isOpen);
        }
      }}
    >
      <ModalContent
        title={title[type]}
        subTitle="Once you share a secret, the share link is only accessible once."
      >
        <ConsumerSecretForm
          type={type}
          popUp={popUp}
          handlePopUpToggle={handlePopUpToggle}
          data={popUp?.editConsumerSecret?.data as ConsumerSecret}
        />
      </ModalContent>
    </Modal>
  );
};
