import { Modal, ModalContent } from "@app/components/v2";
import { consumerSecretsTypes, ConsumerSecretType } from "@app/const";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { ConsumerSecretForm } from "../ConsumerSecretForm/ConsumerSecretForm";

type Props = {
  type: ConsumerSecretType;
  popUp: UsePopUpState<["createConsumerSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createConsumerSecret"]>,
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
      isOpen={popUp?.createConsumerSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createConsumerSecret", isOpen);
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
          //   value={(popUp.createConsumerSecret.data as { value?: string })?.value}
        />
      </ModalContent>
    </Modal>
  );
};
