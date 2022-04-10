import { useState } from 'react'; 

function add_or_update_map<T>(map: Map<String, Map<String, any>>, key: String, key2: String, value: T) {
    let map2 = map.get(key)
    if (!map2) {
        map2 = new Map<String, any>();
    }
    map2.set(key2, value);
    map.set(key, new Map(map2));
    return map;
}

function delete_map(map: Map<String, Map<String, any>>, key: String, key2: String) {
    let map2 = map.get(key)
    if (!map2) {
        map2 = new Map<String, any>();
    }
    map2.delete(key2);
    map.set(key, new Map(map2));
    return map;
}

function useDoubleMap<T>(initial_map: Map<String, Map<String, T>>): [Map<String, Map<String, T>>, (key1: String, key2: String, value_: T) => void, (key1: String, key2: String) => void] {
    let [value, setValue] = useState<Map<String, Map<String, T>>>(initial_map);
    
    const UpdateValue = (key1: String, key2: String, value_: T) => {
        setValue(prevMap => new Map(add_or_update_map<T>(prevMap, key1, key2, value_)));
    }

    const DeleteValue = (key1: String, key2: String) => {
        setValue(prevMap => new Map(delete_map(prevMap, key1, key2)));
    }

    return [value, UpdateValue, DeleteValue ];
}

export default useDoubleMap;