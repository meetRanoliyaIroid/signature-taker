import Joi from "joi";

const saveSignatureSchema = Joi.object({
  signer_name: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Signer name is required",
    "any.required": "Signer name is required",
  }),
  signer_email: Joi.string().email().optional().allow("", null),
  signature_data: Joi.string()
    .required()
    .pattern(/^data:image\/png;base64,/)
    .messages({
      "string.pattern.base": "Signature must be a valid PNG data URL",
      "string.empty": "Signature data is required",
      "any.required": "Signature data is required",
    }),
});

export default saveSignatureSchema;
