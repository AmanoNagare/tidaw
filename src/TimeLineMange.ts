type TLObjectOption =
  | "Triplet" //三連符
  | "Septuplet"; //七連付

interface TLObject {
  pitch: number; //Hz
  length: number; //64部音符n個
  option: TLObjectOption[] | null; //オプション
}

interface Property {}

interface TLLayer {
  objects: TLObject[];
  property: Property;
}

export interface TimeLine {
  layers: TLLayer[];
  bpm: number; //四分音符単位
}
