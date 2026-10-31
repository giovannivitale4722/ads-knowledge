CXX ?= c++
CXXFLAGS ?= -std=c++17 -O2 -Wall -Wextra -pedantic
BUILD := build

SIM_SRCS := src/main.cpp src/simulate.cpp src/troas_bidder.cpp
TEST_SRCS := src/tests.cpp src/troas_bidder.cpp
DELAY_SIM_SRCS := src/delay_main.cpp src/delayed_bidder.cpp
DELAY_TEST_SRCS := src/delay_tests.cpp src/delayed_bidder.cpp
HEADERS := $(wildcard src/*.hpp)

.PHONY: all run test run-delay test-delay clean

all: $(BUILD)/sim $(BUILD)/tests $(BUILD)/delay_sim $(BUILD)/delay_tests

$(BUILD)/sim: $(SIM_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(SIM_SRCS) -o $@

$(BUILD)/tests: $(TEST_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(TEST_SRCS) -o $@

$(BUILD)/delay_sim: $(DELAY_SIM_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(DELAY_SIM_SRCS) -o $@

$(BUILD)/delay_tests: $(DELAY_TEST_SRCS) $(HEADERS) | $(BUILD)
	$(CXX) $(CXXFLAGS) $(DELAY_TEST_SRCS) -o $@

$(BUILD):
	mkdir -p $(BUILD)

run: $(BUILD)/sim
	./$(BUILD)/sim

test: $(BUILD)/tests
	./$(BUILD)/tests

run-delay: $(BUILD)/delay_sim
	./$(BUILD)/delay_sim

test-delay: $(BUILD)/delay_tests
	./$(BUILD)/delay_tests

clean:
	rm -rf $(BUILD) results
