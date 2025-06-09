

def mediaconvert_generate_combine_job(s3_output_location, input_clippings, input_file, output_filename):
    job_config_combine = {
        "UserMetadata": {},
        "Settings": {
            "TimecodeConfig": {
                "Source": "ZEROBASED",
            },
            "OutputGroups": [
                {
                    "Name": "File Group",
                    "Outputs": [
                        {
                            "ContainerSettings": {
                                "Container": "MP4",
                            },
                            "VideoDescription": {
                                "CodecSettings": {
                                    "Codec": "H_264",
                                    "H264Settings": {
                                        "FramerateDenominator": 1,
                                        "GopSize": 90,
                                        "Bitrate": 5000000,
                                        "FramerateControl": "SPECIFIED",
                                        "RateControlMode": "CBR",
                                        "FramerateNumerator": 30,
                                        "GopSizeUnits": "FRAMES",
                                    },
                                },
                            },
                            "AudioDescriptions": [
                                {
                                    "CodecSettings": {
                                        "Codec": "AAC",
                                        "AacSettings": {
                                            "Bitrate": 64000,
                                            "CodingMode": "CODING_MODE_2_0",
                                            "SampleRate": 48000,
                                        },
                                    },
                                },
                            ],
                            "NameModifier": output_filename,
                        },
                    ],
                    "OutputGroupSettings": {
                        "Type": "FILE_GROUP_SETTINGS",
                        "FileGroupSettings": {
                            "Destination": s3_output_location,
                        },
                    },
                },
            ],
            "FollowSource": 1,
            "Inputs": [
                {
                    "InputClippings": input_clippings,
                    "AudioSelectors": {
                        "Audio Selector 1": {
                            "DefaultSelection": "DEFAULT",
                        },
                    },
                    "VideoSelector": {},
                    "TimecodeSource": "ZEROBASED",
                    "FileInput": input_file,
                },
            ],
        },
        "BillingTagsSource": "JOB",
        "AccelerationSettings": {
            "Mode": "DISABLED",
        },
        "StatusUpdateInterval": "SECONDS_60",
        "Priority": 0,
    }
    return job_config_combine