export declare enum TtsVoice {
    ALLOY = "alloy",
    ASH = "ash",
    BALLAD = "ballad",
    CEDAR = "cedar",
    CORAL = "coral",
    ECHO = "echo",
    FABLE = "fable",
    MARIN = "marin",
    NOVA = "nova",
    ONYX = "onyx",
    SAGE = "sage",
    SHIMMER = "shimmer"
}
export declare class GenerateTtsDto {
    text: string;
    voice: TtsVoice;
}
export declare class TtsResponseDto {
    audioUrl: string;
    cached: boolean;
}
