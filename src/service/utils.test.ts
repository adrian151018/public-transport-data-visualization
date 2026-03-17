import { expect, test } from 'vitest'
import { getStopByCode } from './utils.ts'
import { Stop } from '../models/StopModel.ts';

test("Testing getStopByCode() with valid stop code", () => {
    const stops = [
        {stop_id: "A0328",stop_code: "0328", stop_name: "БУЛ. К. ВЕЛИЧКОВ", stop_lat: "42.70669174194336", stop_lon: "23.29991912841797"}, 
        {stop_id: "A2545",stop_code: "2545", stop_name: "УЛ. ЛЕСНОВСКА РЕКА", stop_lat: "42.780941009521484", stop_lon: "23.392051696777344"}
    ];

    const result = getStopByCode(stops, "2545");
    expect(result).toBeDefined();
    expect(result).toEqual(
        new Stop("A2545", "2545", "УЛ. ЛЕСНОВСКА РЕКА", 42.780941009521484, 23.392051696777344)
    );
})

test("Testing getStopByCode() when stop cannot be found", () => {
    const stops = [
        {stop_id: "A0328",stop_code: "0328", stop_name: "БУЛ. К. ВЕЛИЧКОВ", stop_lat: "42.70669174194336", stop_lon: "23.29991912841797"}, 
        {stop_id: "A2545",stop_code: "2545", stop_name: "УЛ. ЛЕСНОВСКА РЕКА", stop_lat: "42.780941009521484", stop_lon: "23.392051696777344"}
    ];

    const result = getStopByCode(stops, "1351");
    expect(result).toBeUndefined();
})

test("Testing getStopByCode() with empty stop code string", () => {
    const stops = [
        {stop_id: "A0328",stop_code: "0328", stop_name: "БУЛ. К. ВЕЛИЧКОВ", stop_lat: "42.70669174194336", stop_lon: "23.29991912841797"}, 
        {stop_id: "A2545",stop_code: "2545", stop_name: "УЛ. ЛЕСНОВСКА РЕКА", stop_lat: "42.780941009521484", stop_lon: "23.392051696777344"}
    ];

    const result = getStopByCode(stops, "");
    expect(result).toBeUndefined();
})