import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { protos } from '@google-analytics/admin';

/**
 * POST /api/analytics/create-property
 * Creates a new Google Analytics property and returns the measurement ID and tracking script
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { displayName, websiteUrl } = body;

        // Validate required fields
        if (!displayName || !websiteUrl) {
            return NextResponse.json(
                { 
                    message: 'Missing required fields',
                    required: ['displayName', 'websiteUrl']
                },
                { status: 400 }
            );
        }

        // Get credentials from environment variable
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        
        if (!credentialsJson) {
            return NextResponse.json(
                { message: 'Google Analytics credentials not configured' },
                { status: 500 }
            );
        }

        const credentials = JSON.parse(credentialsJson);

        // Initialize Analytics Admin client
        const analyticsAdmin = new AnalyticsAdminServiceClient({
            credentials: credentials
        });

        // Get your Google Analytics account ID
        const [accounts] = await analyticsAdmin.listAccounts({});
        
        if (!accounts || accounts.length === 0) {
            return NextResponse.json(
                { message: 'No Google Analytics accounts found' },
                { status: 404 }
            );
        }

        const accountId = accounts[0].name as string;

        // Create the property
        const [property] = await analyticsAdmin.createProperty({
            property: {
                parent: accountId,
                displayName: displayName,
                timeZone: 'Europe/Skopje',
                currencyCode: 'EUR',
                industryCategory: protos.google.analytics.admin.v1beta.IndustryCategory.TECHNOLOGY
            }
        });

        if (!property || !property.name) {
            return NextResponse.json(
                { message: 'Failed to create property' },
                { status: 500 }
            );
        }

        // Create a data stream for the property
        const [dataStream] = await analyticsAdmin.createDataStream({
            parent: property.name,
            dataStream: {
                type: protos.google.analytics.admin.v1beta.DataStream.DataStreamType.WEB_DATA_STREAM,
                displayName: `${displayName} - Web Stream`,
                webStreamData: {
                    defaultUri: websiteUrl
                }
            }
        });

        // Extract measurement ID
        const measurementId = dataStream?.webStreamData?.measurementId;

        if (!measurementId) {
            return NextResponse.json(
                { message: 'Failed to get measurement ID' },
                { status: 500 }
            );
        }

        // Generate tracking script
        const trackingScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;

        return NextResponse.json(
            {
                message: 'Google Analytics property created successfully',
                property: {
                    name: property.name,
                    displayName: property.displayName,
                    measurementId: measurementId,
                    trackingScript: trackingScript
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Failed to create GA property:', error);
        
        return NextResponse.json(
            {
                message: 'Failed to create Google Analytics property',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}