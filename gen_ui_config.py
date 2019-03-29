# -*- coding: utf-8 -*-
__author__ = 'ehan'

import os
import sys
import json
import logging

logging.basicConfig(level=logging.INFO,
                    format='CONSOLE:%(asctime)s [%(filename)s:%(lineno)d] %(message)s',
                    datefmt='%b %d %Y %H:%M:%S')
VERSION = 1.0
ACORN = "ACORN"
SIPAI = "SIPAI"
OUTPUT_FILE = "logo.json"

class ConfigVals:

    def __init__(self, customer):
        logging.info("input: " + str(customer))
        if customer == ACORN:
            logging.info("customer set to ACORN")
            self.loginLogo = "acorn-logo"
            self.logo = "logo3"
            self.logo2 = "logo2"
            self.text = "2016 匡恩网络 版权所有"
        elif customer == SIPAI:
            logging.info("customer set to SIPAI")
            self.loginLogo = "sipai-logo"
            self.logo = "sipai-logo"
            self.logo2 = "sipai-logo"
            self.text = "上海自动化仪表院"
        else:
            #defaulting to acorn
            logging.info("customer set to default")
            self.loginLogo = "acorn-logo"
            self.logo = "logo3"
            self.logo2 = "logo2"
            self.text = "2016 匡恩网络 版权所有"

def write_file(path, c):
    f = open(path, 'w')
    content = c.__dict__
    jm = json.dumps(content, ensure_ascii=False)
    logging.info("output: " + jm)
    f.write(jm)
    logging.info("output file: " + path)

def check_file_exist(path):
    file_exist = os.path.exists(path)
    is_file = os.path.isfile(path)
    logging.info("file exist: " + str(file_exist))
    logging.info("is file: " + str(is_file))
    if is_file and file_exist:
        return True
    else:
        return False

def main():
    length = len(sys.argv)
    if length == 1:
        print "\n"
        print "ui config generator v" + str(VERSION) + '\n'
        print "usuage: python gen_ui_config.py <CUSTOMER_NAME>" + '\n'
        print "customer names:"
        print "- ACORN"
        print "- SIPAI"
        print "\n"
    else:
        customer_name = sys.argv[1]
        logging.info("---------- starting ui config file generator v" + str(VERSION) + "-----")
        c = ConfigVals(customer_name)
        write_file(OUTPUT_FILE, c)

def main_test():
    logging.info("---------- starting ui config file generator v" + str(VERSION) + "-----")
    c = ConfigVals(SIPAI)
    write_file(OUTPUT_FILE, c)

if __name__ == "__main__":
    main()
    #main_test()
    #test()