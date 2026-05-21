/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/goalchain_program.json`.
 */
export type GoalchainProgram = {
  "address": "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
  "metadata": {
    "name": "goalchainProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptWager",
      "discriminator": [
        214,
        18,
        178,
        214,
        203,
        22,
        50,
        119
      ],
      "accounts": [
        {
          "name": "playerB",
          "writable": true,
          "signer": true
        },
        {
          "name": "wager",
          "writable": true
        },
        {
          "name": "playerBToken",
          "writable": true
        },
        {
          "name": "wagerVault",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "claimBetPayout",
      "discriminator": [
        120,
        6,
        59,
        217,
        73,
        0,
        29,
        129
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fixture",
          "writable": true
        },
        {
          "name": "userBet",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "fixtureVault",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "claimMarketPayout",
      "discriminator": [
        146,
        250,
        99,
        132,
        215,
        35,
        106,
        125
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "marketVault",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "createWager",
      "discriminator": [
        210,
        82,
        178,
        75,
        253,
        34,
        84,
        120
      ],
      "accounts": [
        {
          "name": "playerA",
          "writable": true,
          "signer": true
        },
        {
          "name": "wager",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  103,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "playerA"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "playerAToken",
          "writable": true
        },
        {
          "name": "wagerVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  103,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "wager"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initParodyPlayer",
      "discriminator": [
        47,
        202,
        43,
        87,
        50,
        56,
        115,
        94
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "parodyPlayer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "playerId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "playerId",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "initialSpeed",
          "type": "u8"
        },
        {
          "name": "initialShotPower",
          "type": "u8"
        },
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "initialBaseYield",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "oracleAuthority",
          "type": "pubkey"
        },
        {
          "name": "treasuryTokenAccount",
          "type": "pubkey"
        },
        {
          "name": "feeBps",
          "type": "u16"
        },
        {
          "name": "cutoffBufferSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initializeFixture",
      "discriminator": [
        26,
        99,
        178,
        9,
        192,
        14,
        167,
        207
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fixture",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  105,
                  120,
                  116,
                  117,
                  114,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "matchId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "teamA",
          "type": "string"
        },
        {
          "name": "teamB",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "listForRent",
      "discriminator": [
        176,
        162,
        46,
        173,
        170,
        231,
        95,
        48
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "rentalListing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  110,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "parodyPlayerMint"
              }
            ]
          }
        },
        {
          "name": "parodyPlayerMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pricePerMatch",
          "type": "u64"
        }
      ]
    },
    {
      "name": "oracleCreateMarket",
      "discriminator": [
        19,
        161,
        123,
        176,
        174,
        166,
        133,
        105
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "fixture"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u8"
        },
        {
          "name": "marketType",
          "type": {
            "defined": {
              "name": "marketType"
            }
          }
        },
        {
          "name": "delaySeconds",
          "type": "i64"
        },
        {
          "name": "cooldownSeconds",
          "type": "i64"
        },
        {
          "name": "closeMinute",
          "type": "u16"
        },
        {
          "name": "maxGoalDiff",
          "type": "u8"
        },
        {
          "name": "requireTied",
          "type": "bool"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "oracleUpdateMarketStatus",
      "discriminator": [
        7,
        222,
        32,
        186,
        51,
        166,
        155,
        177
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": {
            "defined": {
              "name": "marketStatus"
            }
          }
        },
        {
          "name": "winner",
          "type": {
            "option": {
              "defined": {
                "name": "matchResult"
              }
            }
          }
        }
      ]
    },
    {
      "name": "oracleUpsertLiveState",
      "discriminator": [
        205,
        199,
        16,
        177,
        247,
        142,
        124,
        105
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fixture"
        },
        {
          "name": "liveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "fixture"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "minute",
          "type": "u16"
        },
        {
          "name": "scoreA",
          "type": "u8"
        },
        {
          "name": "scoreB",
          "type": "u8"
        },
        {
          "name": "isHt",
          "type": "bool"
        },
        {
          "name": "isFt",
          "type": "bool"
        }
      ]
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fixture",
          "writable": true
        },
        {
          "name": "userBet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "fixture"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "fixtureVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  105,
                  120,
                  116,
                  117,
                  114,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "fixture"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "prediction",
          "type": {
            "defined": {
              "name": "matchResult"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeMarketBet",
      "discriminator": [
        66,
        187,
        235,
        255,
        123,
        0,
        7,
        85
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "fixture"
        },
        {
          "name": "liveState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "fixture"
              }
            ]
          }
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "arg",
                "path": "ticketId"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "marketVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ticketId",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": {
            "defined": {
              "name": "matchResult"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "rentNft",
      "discriminator": [
        171,
        71,
        244,
        6,
        182,
        65,
        239,
        94
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "rentalListing",
          "writable": true
        },
        {
          "name": "borrowerTokenAccount",
          "writable": true
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "resolveWager",
      "discriminator": [
        31,
        179,
        1,
        228,
        83,
        224,
        1,
        123
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "wager",
          "writable": true
        },
        {
          "name": "wagerVault",
          "writable": true
        },
        {
          "name": "winnerToken",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "winnerIsA",
          "type": "bool"
        }
      ]
    },
    {
      "name": "stake",
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userStake",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userStake",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "oracleAuthority",
          "type": "pubkey"
        },
        {
          "name": "treasuryTokenAccount",
          "type": "pubkey"
        },
        {
          "name": "feeBps",
          "type": "u16"
        },
        {
          "name": "cutoffBufferSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateFixtureStatus",
      "discriminator": [
        14,
        200,
        167,
        94,
        61,
        130,
        67,
        213
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "fixture",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": {
            "defined": {
              "name": "matchStatus"
            }
          }
        },
        {
          "name": "winner",
          "type": {
            "option": {
              "defined": {
                "name": "matchResult"
              }
            }
          }
        }
      ]
    },
    {
      "name": "updatePlayerStats",
      "discriminator": [
        61,
        85,
        73,
        244,
        51,
        95,
        21,
        33
      ],
      "accounts": [
        {
          "name": "oracleAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "parodyPlayer",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newGoals",
          "type": "u8"
        },
        {
          "name": "newAssists",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "fixture",
      "discriminator": [
        46,
        254,
        24,
        43,
        40,
        44,
        141,
        197
      ]
    },
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "liveMatchState",
      "discriminator": [
        113,
        204,
        18,
        231,
        20,
        74,
        161,
        111
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "marketPosition",
      "discriminator": [
        136,
        12,
        225,
        19,
        231,
        148,
        194,
        134
      ]
    },
    {
      "name": "parodyPlayer",
      "discriminator": [
        103,
        52,
        6,
        27,
        226,
        55,
        131,
        214
      ]
    },
    {
      "name": "rentalListing",
      "discriminator": [
        76,
        239,
        227,
        36,
        98,
        137,
        187,
        158
      ]
    },
    {
      "name": "userBet",
      "discriminator": [
        180,
        131,
        8,
        241,
        60,
        243,
        46,
        63
      ]
    },
    {
      "name": "userStake",
      "discriminator": [
        102,
        53,
        163,
        107,
        9,
        138,
        87,
        153
      ]
    },
    {
      "name": "wager",
      "discriminator": [
        3,
        110,
        53,
        190,
        113,
        31,
        230,
        40
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "unauthorizedOracle",
      "msg": "Unauthorized oracle"
    },
    {
      "code": 6002,
      "name": "invalidConfig",
      "msg": "Invalid config"
    },
    {
      "code": 6003,
      "name": "mustClaimFirst",
      "msg": "Must claim first"
    },
    {
      "code": 6004,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6005,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6006,
      "name": "listingNotActive",
      "msg": "Listing not active"
    },
    {
      "code": 6007,
      "name": "alreadyRented",
      "msg": "Already rented"
    },
    {
      "code": 6008,
      "name": "wagerNotAvailable",
      "msg": "Wager not available"
    },
    {
      "code": 6009,
      "name": "wagerNotReady",
      "msg": "Wager not ready"
    },
    {
      "code": 6010,
      "name": "bettingClosed",
      "msg": "Betting closed"
    },
    {
      "code": 6011,
      "name": "matchNotFinished",
      "msg": "Match not finished"
    },
    {
      "code": 6012,
      "name": "noWinnerDeclared",
      "msg": "No winner declared"
    },
    {
      "code": 6013,
      "name": "notAWinner",
      "msg": "Not a winner"
    },
    {
      "code": 6014,
      "name": "alreadyClaimed",
      "msg": "Already claimed"
    },
    {
      "code": 6015,
      "name": "invalidPool",
      "msg": "Invalid pool"
    },
    {
      "code": 6016,
      "name": "invalidVault",
      "msg": "Invalid vault"
    },
    {
      "code": 6017,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6018,
      "name": "invalidTreasury",
      "msg": "Invalid treasury"
    },
    {
      "code": 6019,
      "name": "invalidMarketConfig",
      "msg": "Invalid market config"
    },
    {
      "code": 6020,
      "name": "invalidMarket",
      "msg": "Invalid market"
    },
    {
      "code": 6021,
      "name": "invalidLiveState",
      "msg": "Invalid live state"
    },
    {
      "code": 6022,
      "name": "claimTooEarly",
      "msg": "Claim too early"
    }
  ],
  "types": [
    {
      "name": "fixture",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "teamA",
            "type": "string"
          },
          {
            "name": "teamB",
            "type": "string"
          },
          {
            "name": "startTimestamp",
            "type": "i64"
          },
          {
            "name": "poolA",
            "type": "u64"
          },
          {
            "name": "poolB",
            "type": "u64"
          },
          {
            "name": "poolDraw",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "matchStatus"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": {
                "defined": {
                  "name": "matchResult"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "oracleAuthority",
            "type": "pubkey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "cutoffBufferSeconds",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "liveMatchState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixture",
            "type": "pubkey"
          },
          {
            "name": "minute",
            "type": "u16"
          },
          {
            "name": "scoreA",
            "type": "u8"
          },
          {
            "name": "scoreB",
            "type": "u8"
          },
          {
            "name": "isHt",
            "type": "bool"
          },
          {
            "name": "isFt",
            "type": "bool"
          },
          {
            "name": "lastUpdateTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixture",
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "docs": [
              "Stable market identifier used for PDA derivation (0-255)."
            ],
            "type": "u8"
          },
          {
            "name": "marketType",
            "type": {
              "defined": {
                "name": "marketType"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "delaySeconds",
            "type": "i64"
          },
          {
            "name": "cooldownSeconds",
            "type": "i64"
          },
          {
            "name": "closeMinute",
            "type": "u16"
          },
          {
            "name": "maxGoalDiff",
            "type": "u8"
          },
          {
            "name": "requireTied",
            "type": "bool"
          },
          {
            "name": "poolA",
            "type": "u64"
          },
          {
            "name": "poolB",
            "type": "u64"
          },
          {
            "name": "poolDraw",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": {
              "option": {
                "defined": {
                  "name": "matchResult"
                }
              }
            }
          },
          {
            "name": "lastBetTs",
            "type": "i64"
          },
          {
            "name": "resolvedTs",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "ticketId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": {
              "defined": {
                "name": "matchResult"
              }
            }
          },
          {
            "name": "betTs",
            "type": "i64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "closed"
          },
          {
            "name": "resolved"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "marketType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "matchResultLive"
          },
          {
            "name": "nextGoal"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "matchResult",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "teamA"
          },
          {
            "name": "teamB"
          },
          {
            "name": "draw"
          }
        ]
      }
    },
    {
      "name": "matchStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "upcoming"
          },
          {
            "name": "live"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "parodyPlayer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "playerId",
            "type": "string"
          },
          {
            "name": "realWorldGoals",
            "type": "u8"
          },
          {
            "name": "realWorldAssists",
            "type": "u8"
          },
          {
            "name": "matchesPlayed",
            "type": "u8"
          },
          {
            "name": "speed",
            "type": "u8"
          },
          {
            "name": "shotPower",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rentalListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "pricePerMatch",
            "type": "u64"
          },
          {
            "name": "currentBorrower",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userBet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "fixture",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": {
              "defined": {
                "name": "matchResult"
              }
            }
          },
          {
            "name": "betTimestamp",
            "type": "i64"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userStake",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startTimestamp",
            "type": "i64"
          },
          {
            "name": "unclaimedRewards",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "wager",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerA",
            "type": "pubkey"
          },
          {
            "name": "playerB",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "wagerState"
              }
            }
          }
        ]
      }
    },
    {
      "name": "wagerState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "accepted"
          },
          {
            "name": "resolved"
          }
        ]
      }
    }
  ]
};
