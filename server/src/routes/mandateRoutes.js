import express from "express";
import { ingestFailureEvent, getMandateStatus, listMandates } from "../controllers/mandateController.js";

const router = express.Router();

router.post("/failure", ingestFailureEvent);
router.get("/:mandateId", getMandateStatus);
router.get("/", listMandates);

export default router;