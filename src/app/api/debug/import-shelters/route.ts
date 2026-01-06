import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

/**
 * Import Shelters from JSON file
 * Imports shelter data from OperationCenters JSON backup
 * 
 * Access: GET /api/debug/import-shelters
 */
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');
        const sheltersCollection = db.collection('operationcenters');

        // Read JSON file
        const jsonPath = path.join(process.cwd(), 'OperationCenters_2025-12-19_14-48-11.json');

        if (!fs.existsSync(jsonPath)) {
            return NextResponse.json({
                error: 'JSON file not found',
                details: 'Please ensure OperationCenters_2025-12-19_14-48-11.json is in the project root'
            }, { status: 404 });
        }

        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        if (!jsonData.data || !Array.isArray(jsonData.data)) {
            return NextResponse.json({
                error: 'Invalid JSON format',
                details: 'Expected data array not found'
            }, { status: 400 });
        }

        const shelters = jsonData.data;
        const results = {
            total: shelters.length,
            imported: 0,
            skipped: 0,
            errors: [] as string[]
        };

        // Import each shelter
        for (const shelter of shelters) {
            try {
                // Check if shelter already exists (by name and district)
                const existing = await sheltersCollection.findOne({
                    name: shelter.name,
                    district: shelter.district,
                    subdistrict: shelter.subdistrict
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                // Prepare shelter data (remove old _id, keep structure)
                const newShelter = {
                    name: shelter.name,
                    description: shelter.description,
                    location: shelter.location,
                    capacity: shelter.capacity,
                    capacityStatus: shelter.capacityStatus,
                    shelterType: shelter.shelterType,
                    phoneNumbers: shelter.phoneNumbers || [],
                    responsible: shelter.responsible || [],
                    status: shelter.status || 'active',
                    district: shelter.district,
                    subdistrict: shelter.subdistrict,
                    createdAt: shelter.createdAt || new Date().toISOString(),
                    updatedAt: shelter.updatedAt || new Date().toISOString(),
                    createdBy: shelter.createdBy || 'import-script'
                };

                await sheltersCollection.insertOne(newShelter);
                results.imported++;

            } catch (error) {
                results.errors.push(`Failed to import ${shelter.name}: ${String(error)}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Import completed',
            data: results
        });

    } catch (error) {
        console.error('Import Shelters Error:', error);
        return NextResponse.json({
            error: 'Failed to import shelters',
            details: String(error)
        }, { status: 500 });
    }
}
