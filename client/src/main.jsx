import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
    try {
        const body = await req.json();

        const {
            workOrderNo,
            copyTo,
            newNo,
            serviceLocationNo,
            serviceLocationName,
            serviceLocationDetails,
            billToNo,
            billToName,
            billToDetails,
            internalDescription,
            reference,
            autoCalc,
            hst,
        } = body;

        const filePath = path.join(process.cwd(), "data", "workorder-address.json");

        let records = [];

        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            records = JSON.parse(fileData);
        } catch (error) {
            records = [];
        }

        const newRecord = {
            id: Date.now(),
            workOrderNo: workOrderNo || "",
            copyTo: copyTo || "",
            newNo: newNo || "",
            serviceLocationNo: serviceLocationNo || "",
            serviceLocationName: serviceLocationName || "",
            serviceLocationDetails: serviceLocationDetails || "",
            billToNo: billToNo || "",
            billToName: billToName || "",
            billToDetails: billToDetails || "",
            internalDescription: internalDescription || "",
            reference: reference || false,
            autoCalc: autoCalc ?? true,
            hst: hst || "yes",
            createdAt: new Date().toISOString(),
        };

        records.push(newRecord);

        await fs.writeFile(filePath, JSON.stringify(records, null, 2));

        return NextResponse.json(
            { success: true, message: "Address saved successfully", data: newRecord },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to save address" },
            { status: 500 }
        );
    }
}