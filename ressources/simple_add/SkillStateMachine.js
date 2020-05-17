/**
 * Copyright 2019 Siemens AG.
 * 
 * File: SkillVis.js
 * Project: SP 347
 * Author:
 *  - Jupiter Bakakeu
 **/

var xstate = require('xstate');

var Machine = xstate.Machine;
var interpret = xstate.interpret;

class SkillStateMachine {
    constructor(logger, parent_skill) {
        var self = this;
        this.logger = logger;
        this.parent_skill = parent_skill;
        this.current_state = null;
        this.idle_state_machine_definition = {
            initial: 'init_skill',
            states: {
                init_skill: {
                    after: {
                        1000: 'skill_ready'
                    }
                },
                skill_ready: {}
            }
        };

        this.execute_state_machine_definition = {
            initial: 'execute_skill',
            states: {
                execute_skill: {
                    onDone: 'completing',
                    on: {
                        NEXT_STEP: 'wait_next_step'
                    }
                },
                wait_next_step: {
                    on: {
                        CONTINUE: 'execute_skill'
                    }
                },
                execution_end: {
                    type: 'final'
                }
            }
        };

        this.hold_state_machine_definition = {
            initial: 'holding',
            states: {
                holding: {
                    after: {
                        1000: 'held'
                    }
                },
                held: {
                    on: {
                        UNHOLD: 'unholding'
                    }
                },
                unholding: {
                    type: 'final'
                }
            },
            onDone: 'execute'
        };

        this.resetting_state_machine_definition = {
            initial: 'check_resource',
            states: {
                check_resource: {
                    on: {
                        OK: 'skill_initialized',
                        NOK: 'initialize_resource'

                    },
                    after: {
                        1000: 'skill_initialized'
                    }
                },
                initialize_resource: {
                    after: {
                        1000: 'check_resource'
                    }
                },
                skill_initialized: {
                    type: 'final'
                }
            },
            onDone: 'idle'
        };

        this.running_state_machine_definition = {
            initial: 'resetting',
            states: {
                resetting: {
                    initial: 'check_resource',
                    states: {
                        check_resource: {
                            on: {
                                OK: 'skill_initialized',
                                NOK: 'initialize_resource'

                            },
                            after: {
                                1000: 'skill_initialized'
                            }
                        },
                        initialize_resource: {
                            after: {
                                1000: 'check_resource'
                            }
                        },
                        skill_initialized: {
                            type: 'final'
                        }
                    },
                    onDone: 'idle'
                },
                idle: {
                    on: {
                        CALL_SKILL: 'execute'
                    },
                    initial: 'init_skill',
                    states: {
                        init_skill: {
                            after: {
                                1000: 'skill_ready'
                            }
                        },
                        skill_ready: {}
                    }
                },
                execute: {
                    on: {
                        HOLD: 'hold'
                    },
                    onDone: 'completing',
                    initial: 'execute_skill',
                    states: {
                        execute_skill: {
                            after: {
                                10000: 'execution_end'
                            },
                            on: {
                                NEXT_STEP: 'wait_next_step'
                            }
                        },
                        wait_next_step: {
                            on: {
                                CONTINUE: 'execute_skill'
                            }
                        },
                        execution_end: {
                            type: 'final'
                        }
                    }
                },
                completing: {
                    after: {
                        1000: 'completed'
                    }
                },
                completed: {
                    after: {
                        1000: 'resetting'
                    }
                },
                hold: {
                    initial: 'holding',
                    states: {
                        holding: {
                            after: {
                                1000: 'held'
                            }
                        },
                        held: {
                            on: {
                                UNHOLD: 'unholding'
                            }
                        },
                        unholding: {
                            type: 'final'
                        }
                    },
                    onDone: 'execute'
                }
            }
        };

        this.cleared_state_machine_definition = {
            initial: 'clearing',
            states: {
                stopped: {
                    on: {
                        RESET: 'running'
                    }
                },
                running: {
                    on: {
                        STOP: 'stopping'
                    },

                    initial: 'resetting',
                    states: {
                        resetting: {
                            initial: 'check_resource',
                            states: {
                                check_resource: {
                                    on: {
                                        OK: 'skill_initialized',
                                        NOK: 'initialize_resource'

                                    },
                                    after: {
                                        1000: 'skill_initialized'
                                    }
                                },
                                initialize_resource: {
                                    after: {
                                        1000: 'check_resource'
                                    }
                                },
                                skill_initialized: {
                                    type: 'final'
                                }
                            },
                            onDone: 'idle'
                        },
                        idle: {
                            on: {
                                CALL_SKILL: 'execute'
                            },
                            initial: 'init_skill',
                            states: {
                                init_skill: {
                                    after: {
                                        1000: 'skill_ready'
                                    }
                                },
                                skill_ready: {}
                            }
                        },
                        execute: {
                            on: {
                                HOLD: 'hold'
                            },
                            onDone: 'completing',
                            initial: 'execute_skill',
                            states: {
                                execute_skill: {
                                    after: {
                                        10000: 'execution_end'
                                    },
                                    on: {
                                        NEXT_STEP: 'wait_next_step'
                                    }
                                },
                                wait_next_step: {
                                    on: {
                                        CONTINUE: 'execute_skill'
                                    }
                                },
                                execution_end: {
                                    type: 'final'
                                }
                            }
                        },
                        completing: {
                            after: {
                                1000: 'completed'
                            }
                        },
                        completed: {
                            after: {
                                1000: 'resetting'
                            }
                        },
                        hold: {
                            initial: 'holding',
                            states: {
                                holding: {
                                    after: {
                                        1000: 'held'
                                    }
                                },
                                held: {
                                    on: {
                                        UNHOLD: 'unholding'
                                    }
                                },
                                unholding: {
                                    type: 'final'
                                }
                            },
                            onDone: 'execute'
                        }
                    }
                },
                stopping: {
                    after: {
                        1000: 'stopped'
                    }
                },
                clearing: {
                    after: {
                        1000: 'stopped'
                    }
                },
            }
        };

        this.skill_state_machine_definition = {
            initial: 'cleared',
            states: {
                aborted: {
                    on: {
                        CLEAR: 'cleared'
                    }
                },
                aborting: {
                    after: {
                        1000: 'aborted'
                    }
                },
                cleared: {
                    on: {
                        ABORT: 'aborting'
                    },
                    initial: 'clearing',
                    states: {
                        stopped: {
                            on: {
                                RESET: 'running'
                            }
                        },
                        running: {
                            on: {
                                STOP: 'stopping'
                            },
                            initial: 'resetting',
                            states: {
                                resetting: {
                                    initial: 'check_resource',
                                    states: {
                                        check_resource: {
                                            on: {
                                                OK: 'skill_initialized',
                                                NOK: 'initialize_resource'

                                            },
                                            after: {
                                                1000: 'skill_initialized'
                                            }
                                        },
                                        initialize_resource: {
                                            after: {
                                                1000: 'check_resource'
                                            }
                                        },
                                        skill_initialized: {
                                            type: 'final'
                                        }
                                    },
                                    onDone: 'idle'
                                },
                                idle: {
                                    on: {
                                        CALL_SKILL: 'execute'
                                    },
                                    initial: 'init_skill',
                                    states: {
                                        init_skill: {
                                            after: {
                                                1000: 'skill_ready'
                                            }
                                        },
                                        skill_ready: {}
                                    }
                                },
                                execute: {
                                    on: {
                                        HOLD: 'hold'
                                    },
                                    onDone: 'completing',
                                    initial: 'execute_skill',
                                    states: {
                                        execute_skill: {
                                            after: {
                                                10000: 'execution_end'
                                            },
                                            on: {
                                                NEXT_STEP: 'wait_next_step'
                                            }
                                        },
                                        wait_next_step: {
                                            on: {
                                                CONTINUE: 'execute_skill'
                                            }
                                        },
                                        execution_end: {
                                            type: 'final'
                                        }
                                    }
                                },
                                completing: {
                                    after: {
                                        1000: 'completed'
                                    }
                                },
                                completed: {
                                    after: {
                                        1000: 'resetting'
                                    }
                                },
                                hold: {
                                    initial: 'holding',
                                    states: {
                                        holding: {
                                            after: {
                                                1000: 'held'
                                            }
                                        },
                                        held: {
                                            on: {
                                                UNHOLD: 'unholding'
                                            }
                                        },
                                        unholding: {
                                            type: 'final'
                                        }
                                    },
                                    onDone: 'execute'
                                }
                            }
                        },
                        stopping: {
                            after: {
                                1000: 'stopped'
                            }
                        },
                        clearing: {
                            after: {
                                1000: 'stopped'
                            }
                        },
                    }
                }
            }
        };

        this.skill_state_machine = Machine(this.skill_state_machine_definition);

        this.service = interpret(this.skill_state_machine)
            .onTransition(function(state) {
                self.current_state = state.value;
                self.parent_skill.logger.info(state.value);
                self.parent_skill.updateOPCUAServerCurrentStateValues(state.value);
            });
    }

    start() {
        this.service.start();
    }

    stop() {
        this.service.stop();
    }

    clear() {
        this.skill_state_machine = null;
    }

    clearSkill() {
        this.service.send('CLEAR');
    }

    abortSkill() {
        this.service.send('ABORT');
    }

    resetSkill(arg) {
        var self = this;
        this.service.send({
            "type": "RESET"
        }, arg);
    }

    stopSkill() {
        this.service.send('STOP');

    }

    startSkill() {
        this.service.send('CALL_SKILL');
    }

    holdSkill() {
        this.service.send('HOLD');
    }

    unholdSkill() {
        this.service.send('UNHOLD');
    }
}

module.exports = SkillStateMachine;