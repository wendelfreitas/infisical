import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button, DeleteActionModal } from "@app/components/v2";
import { consumerSecretsTypes } from "@app/const";
import { useDeleteConsumerSecretById } from "@app/hooks/api/consumerSecrets/mutations";
import { usePopUp } from "@app/hooks/usePopUp";

import { AddConsumerSecretModal } from "../../../AddConsumerSecretModal/AddConsumerSecretModal";
import { WebLoginTable } from "./WebLoginTable";

export const WebLoginSection = () => {
  const { popUp, handlePopUpOpen, handlePopUpToggle } = usePopUp([
    "createConsumerSecret",
    "removeConsumerSecret",
    "editConsumerSecret"
  ] as const);

  const { mutateAsync: deleteConsumerSecret } = useDeleteConsumerSecretById();

  const handleAddConsumerSecret = () => {
    handlePopUpOpen("createConsumerSecret");
  };

  const onRemoveConsumerSecret = async (consumerSecretId: string) => {
    try {
      await deleteConsumerSecret(
        { consumerSecretId },
        {
          onSuccess() {
            createNotification({
              text: "Successfully removed consumer secret",
              type: "success"
            });
          }
        }
      );
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to remove this consumer secret",
        type: "error"
      });
    }

    handlePopUpToggle("removeConsumerSecret", false);
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Web Login Credentials</p>

        <Button
          colorSchema="primary"
          type="submit"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => handleAddConsumerSecret()}
        >
          Add Web Login
        </Button>
      </div>
      <WebLoginTable handlePopUpOpen={handlePopUpOpen} />
      <AddConsumerSecretModal
        type={consumerSecretsTypes.webLogin}
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
      />
      <DeleteActionModal
        isOpen={popUp.removeConsumerSecret.isOpen}
        title="Are you sure want to remove this credentials?"
        onChange={(isOpen) => handlePopUpToggle("removeConsumerSecret", isOpen)}
        deleteKey="delete"
        onDeleteApproved={() =>
          onRemoveConsumerSecret((popUp?.removeConsumerSecret?.data as { id: string })?.id)
        }
      />
    </div>
  );
};
