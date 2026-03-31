import SignatureService from "../services/signatureService";
import CustomHelper from "../helpers/customHelper";

class SignatureController {
  static async index(req, res) {
    res.render("index", { title: "Draw Signature" });
  }

  static async store(req, res) {
    const { signer_name, signer_email, signature_data } = req.body;
    const ip_address = req.ip;

    const signature = await SignatureService.create({
      signer_name,
      signer_email,
      signature_data,
      ip_address,
    });

    return CustomHelper.success(res, "Signature saved successfully", {
      id: signature.id,
    });
  }

  static async list(req, res) {
    const signatures = await SignatureService.getAll();
    res.render("list", { title: "All Signatures", signatures });
  }

  static async show(req, res) {
    const signature = await SignatureService.getById(req.params.id);
    res.render("show", { title: "Signature Detail", signature });
  }

  static async destroy(req, res) {
    await SignatureService.revoke(req.params.id);
    res.redirect("/signatures");
  }
}

export default SignatureController;
