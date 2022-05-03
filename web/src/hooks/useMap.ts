import { useState } from 'react'; 

function useMap<T>(initial_map: Map<String, T>): [Map<String, T>, React.Dispatch<React.SetStateAction<Map<String, T>>>, (key: String) => void] {
    let [value, setValue] = useState<Map<String, T>>(initial_map);
    const DeleteValue = (key: String) => {
        setValue((prevMap) => {
            let map = new Map(prevMap);
            map.delete(key);
            return new Map(map);
        });
    }
    return [value, setValue, DeleteValue ];
}

export default useMap