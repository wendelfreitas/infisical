import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input } from "@app/components/v2";
import { consumerSecretsTypes, ConsumerSecretType } from "@app/const";
import { useCreateConsumerSecret } from "@app/hooks/api/consumerSecrets/mutations";
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
  name: z.string().optional()
});

const secureNoteSchema = z.object({
  type: z.literal("secure-note"),
  name: z.string().optional(),
  content: z.string({ required_error: "Content is required" })
});

type Props = {
  type: ConsumerSecretType;
  popUp: UsePopUpState<["createConsumerSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createConsumerSecret"]>,
    state?: boolean
  ) => void;
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

export const ConsumerSecretForm = ({ type, handlePopUpToggle }: Props) => {
  const { mutateAsync: createConsumerSecret } = useCreateConsumerSecret({
    options: {
      onSuccess({ orgId }) {
        queryClient.refetchQueries(["consumer-secrets", orgId, type]);
        handlePopUpToggle("createConsumerSecret", false);
      }
    }
  });

  const schema = getSchema(type);

  const {
    control,
    handleSubmit,

    formState: { isSubmitting, errors }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      type
    }
  });

  console.log(errors);

  const notification: {
    [key: string]: {
      title: string;
      error: string;
    };
  } = {
    [consumerSecretsTypes.webLogin]: {
      title: "Web Credentials created successfully",
      error: "Failed to create Web Credential"
    }
  };

  const onFormSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await createConsumerSecret(data);
      createNotification({
        text: notification[type].title,
        type: "success"
      });
    } catch (error) {
      createNotification({
        text: notification[type].error,
        type: "error"
      });
    }
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
            <FormControl label="Username" isError={Boolean(error)} errorText={error?.message}>
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
        Create Consumer Secret
      </Button>
    </form>
  );
};
