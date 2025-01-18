module.exports.ffmpeg =
{
    flags:
    [
        // "hls_flags=second_level_segment_index",
        // "hls_segment_filename='file-%Y%m%d-%s.ts'",
        // "hls_segment_filename=file_%v_%03d.ts", 
        "hls_start_number_source=datetime",
        "hls_time=8",
        "hls_list_size=40",
        // "hls_segment_wrap=10",
        // "hls_delete_treshold=0",
        "hls_flags=delete_segments",
        "hls_flags=program_date_time",
        "hls_flags=temp_file"
    //    "hls_start_number_source=datetime",
    //    "tune=zerolatency",
    //    "g=2"
    ]
} 