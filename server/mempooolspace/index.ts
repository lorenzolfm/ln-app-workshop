import https from "https";

export async function getRecommendedFees(): Promise<{
    fastest: number,
    hour: number,
    halfHour: number,
    minimum: number,
}> {
    return new Promise((resolve, reject) => {
        https.get('https://mempool.space/api/v1/fees/recommended', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    const fees = {
                        fastest: jsonData.fastestFee,
                        hour: jsonData.hourFee,
                        halfHour: jsonData.halfHourFee,
                        minimum: jsonData.minimumFee
                    };
                    resolve(fees);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
