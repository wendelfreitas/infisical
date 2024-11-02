import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input } from "@app/components/v2";
import { ConsumerSecretType } from "@app/const";

const baseSchema = z.object({
  type: z.enum(["web-login", "secure-content"]),
  name: z.string()
});

const dynamicSchema = baseSchema.and(
  z.union([
    z.object({
      type: z.literal("web-login"),
      username: z.string({ required_error: "Username is required" }),
      password: z.string({ required_error: "Password is required" })
    }),
    z.object({
      type: z.literal("secure-content"),
      content: z.string({ required_error: "Content is required" })
    })
  ])
);

export type FormData = z.infer<typeof dynamicSchema>;

type Props = {
  type: ConsumerSecretType;
  isPublic: boolean; // whether or not this is a public (non-authenticated) secret sharing form
  value?: string;
};

export const ConsumerSecretForm = ({ type, value }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      type: "secure-content"
    }
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      if (data.type === "secure-content") {
        createNotification({
          text: "Shared secret link copied to clipboard.",
          type: "success"
        });
      }
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create a shared secret.",
        type: "error"
      });
    }
  };

  const dynamicFields: {
    [key: string]: React.ReactNode;
  } = {
    "web-login": (
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
            <FormControl label="Password" isError={Boolean(error)} errorText={error?.message}>
              <Input {...field} placeholder="Password" type="password" />
            </FormControl>
          )}
        />
      </>
    ),
    "secure-note": (
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
              disabled={value !== undefined}
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
