import Signature from "../../model/signature";
import { SIGNATURE_STATUS } from "../config/enum";
import { NotFoundException } from "../config/errorException";

class SignatureService {
  static async create(data) {
    const signature = await Signature.create({
      signer_name: data.signer_name,
      signer_email: data.signer_email || null,
      signature_data: data.signature_data,
      ip_address: data.ip_address || null,
    });
    return signature;
  }

  static async getAll() {
    const signatures = await Signature.findAll({
      order: [["created_at", "DESC"]],
    });
    return signatures;
  }

  static async getById(id) {
    const signature = await Signature.findOne({ where: { id } });
    if (!signature) {
      throw new NotFoundException("Signature not found");
    }
    return signature;
  }

  static async revoke(id) {
    const signature = await this.getById(id);
    signature.status = SIGNATURE_STATUS.REVOKED;
    await signature.save();
    return signature;
  }
}

export default SignatureService;
