module.exports.ffmpeg =
{
    flags:
    [
        "hls_time=2",
        "hls_list_size=30",
        // "hls_delete_treshold=10",
        "hls_flags=delete_segments",
        "hls_flags=program_date_time",
       "hls_start_number_source=epoch"
    ]
}