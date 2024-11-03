import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input } from "@app/components/v2";
import { consumerSecretsTypes, ConsumerSecretType } from "@app/const";
import {
  useCreateConsumerSecret,
  useUpdateConsumerSecret
} from "@app/hooks/api/consumerSecrets/mutations";
import {
  ConsumerSecret,
  ConsumerSecretSecretCreditCard,
  ConsumerSecretSecureNote,
  ConsumerSecretWebLogin
} from "@app/hooks/api/consumerSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";
import { queryClient } from "@app/reactQuery";

const webLoginSchema = z.object({
  type: z.literal("web-login"),
  name: z.string().optional(),
  username: z.string({ required_error: "Username is required" }).min(3),
  password: z.string({ required_error: "Password is required" })
});

const creditCardSchema = z.object({
  type: z.literal("credit-card"),
  name: z.string().optional(),
  cardNumber: z.coerce
    .number({
      invalid_type_error: "Expected only numbers"
    })
    .refine(
      (value) => String(value).length >= 13 && String(value).length <= 16,
      "Credit card number must be 13 to 16 digits long"
    ),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid date format. Expected mm/yy.")
    .refine((date) => {
      const [month, year] = date.split("/").map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      return year > currentYear || (year === currentYear && month >= currentMonth);
    }, "Expiry date must be in the future."),
  cvv: z.coerce
    .number({
      invalid_type_error: "Expected only numbers"
    })
    .refine(
      (value) => String(value).length >= 3 && String(value).length <= 4,
      "CVV must be 3 to 4 digits long"
    )
});

const secureNoteSchema = z.object({
  type: z.literal("secure-note"),
  name: z.string().optional(),
  content: z.string({ required_error: "Content is required" })
});

type Props = {
  type: ConsumerSecretType;
  popUp: UsePopUpState<["createConsumerSecret", "editConsumerSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createConsumerSecret", "editConsumerSecret"]>,
    state?: boolean
  ) => void;
  data?: ConsumerSecret;
};

const getSchema = (type: string) => {
  switch (type) {
    case consumerSecretsTypes.webLogin:
      return webLoginSchema;

    case consumerSecretsTypes.creditCard:
      return creditCardSchema;

    case consumerSecretsTypes.secureNote:
      return secureNoteSchema;

    default:
      return webLoginSchema;
  }
};

export const ConsumerSecretForm = ({ type, handlePopUpToggle, data: editable }: Props) => {
  const notification: {
    [key: string]: {
      title: string;
      error: string;
    };
  } = {
    [consumerSecretsTypes.webLogin]: {
      title: `Web Credentials ${editable ? "edited" : "created"} successfully`,
      error: `Failed to ${editable ? "edit" : "create"} Web Credential`
    },
    [consumerSecretsTypes.creditCard]: {
      title: `Credit Card ${editable ? "edited" : "created"} successfully`,
      error: `Failed to ${editable ? "edit" : "create"} Credit Card`
    },
    [consumerSecretsTypes.secureNote]: {
      title: `Secure Note ${editable ? "edited" : "created"} successfully`,
      error: `Failed to ${editable ? "edit" : "create"} Secure Note`
    }
  };

  const { mutateAsync: createConsumerSecret } = useCreateConsumerSecret({
    options: {
      onError() {
        createNotification({
          text: notification[type].error,
          type: "error"
        });
      },
      onSuccess({ orgId }) {
        createNotification({
          text: notification[type].title,
          type: "success"
        });

        queryClient.refetchQueries(["consumer-secrets", orgId, type]);
        handlePopUpToggle("createConsumerSecret", false);
      }
    }
  });

  const { mutateAsync: editConsumerSecret } = useUpdateConsumerSecret({
    options: {
      onError() {
        createNotification({
          text: notification[type].error,
          type: "error"
        });
      },
      onSuccess({ orgId }) {
        createNotification({
          text: notification[type].title,
          type: "success"
        });

        queryClient.refetchQueries(["consumer-secrets", orgId, type]);
        handlePopUpToggle("editConsumerSecret", false);
      }
    }
  });

  const schema = getSchema(type);

  console.log(editable);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      type
    }
  });

  const getEditablesValues = () => {
    if (type === consumerSecretsTypes.secureNote) {
      const secret = editable as unknown as ConsumerSecretSecureNote;

      return {
        type: consumerSecretsTypes.secureNote,
        name: secret.name,
        content: secret.content
      };
    }

    if (type === consumerSecretsTypes.creditCard) {
      const secret = editable as unknown as ConsumerSecretSecretCreditCard;

      return {
        type: consumerSecretsTypes.creditCard,
        name: secret.name,
        cardNumber: Number(secret.cardNumber),
        expiryDate: secret.expiryDate,
        cvv: Number(secret.cvv)
      };
    }

    const secret = editable as unknown as ConsumerSecretWebLogin;

    return {
      type: consumerSecretsTypes.webLogin,
      name: secret.name,
      username: secret.username,
      password: secret.password
    };
  };

  useEffect(() => {
    if (editable) {
      reset(getEditablesValues());
    }
  }, [editable]);

  const onFormSubmit = async (data: z.infer<typeof schema>) => {
    if (editable) {
      return editConsumerSecret({ id: editable.id, ...data });
    }

    return createConsumerSecret(data);
  };

  const dynamicFields: {
    [key: string]: React.ReactNode;
  } = {
    [consumerSecretsTypes.webLogin]: (
      <>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Username"
              isError={Boolean(error)}
              isRequired
              errorText={error?.message}
            >
              <Input {...field} placeholder="Username" type="text" />
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Password"
              isError={Boolean(error)}
              isRequired
              errorText={error?.message}
            >
              <Input {...field} placeholder="Password" type="password" />
            </FormControl>
          )}
        />
      </>
    ),
    [consumerSecretsTypes.creditCard]: (
      <>
        <Controller
          control={control}
          name="cardNumber"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Card Number"
              isError={Boolean(error)}
              errorText={error?.message}
              isRequired
            >
              <Input {...field} placeholder="5610 5910 8101 8250" min={13} max={16} />
            </FormControl>
          )}
        />

        <div className="grid grid-cols-12 justify-between gap-x-5">
          <Controller
            control={control}
            name="expiryDate"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Expiry Date"
                isError={Boolean(error)}
                isRequired
                className="col-span-7"
                errorText={error?.message}
              >
                <Input {...field} placeholder="mm/yy" type="text" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="cvv"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="CVV"
                isError={Boolean(error)}
                className="col-span-5"
                isRequired
                errorText={error?.message}
              >
                <Input {...field} placeholder="CVV" type="text" />
              </FormControl>
            )}
          />
        </div>
      </>
    ),
    [consumerSecretsTypes.secureNote]: (
      <Controller
        control={control}
        name="content"
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Content"
            isError={Boolean(error)}
            errorText={error?.message}
            className="mb-2"
            isRequired
          >
            <textarea
              placeholder="Enter sensitive data to share."
              {...field}
              className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
            />
          </FormControl>
        )}
      />
    )
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl label="Name (Optional)" isError={Boolean(error)} errorText={error?.message}>
            <Input {...field} placeholder="Resend, Vercel, GitHub, Infisical" type="text" />
          </FormControl>
        )}
      />

      {dynamicFields[type]}

      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {editable ? "Edit" : "Create"} Consumer Secret
      </Button>
    </form>
  );
};
